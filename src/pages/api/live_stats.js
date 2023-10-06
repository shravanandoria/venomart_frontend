import dbConnect from "../../lib/dbConnect";
import Activity from "../../Models/Activity";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case "GET":
            try {
                const twentyFourHoursAgo = new Date();
                twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

                const allTimeSalesPipeline = [
                    {
                        $match: {
                            type: "sale"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            AllTimeSalesVolume: {
                                $sum: {
                                    $toDouble: "$price"
                                }
                            }
                        }
                    }
                ];

                const salesLast24HoursPipeline = [
                    {
                        $match: {
                            type: "sale",
                            createdAt: {
                                $gte: twentyFourHoursAgo
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            SalesVolumeLast24Hours: {
                                $sum: {
                                    $toDouble: "$price"
                                }
                            },
                            SalesCountLast24Hours: {
                                $sum: 1
                            }
                        }
                    }
                ];

                const [allTimeSalesResult, salesLast24HoursResult] = await Promise.all([
                    Activity.aggregate(allTimeSalesPipeline),
                    Activity.aggregate(salesLast24HoursPipeline)
                ]);

                const allTimeSalesVolume = allTimeSalesResult[0]?.AllTimeSalesVolume || 0;
                const { SalesVolumeLast24Hours, SalesCountLast24Hours } = salesLast24HoursResult[0] || { SalesVolumeLast24Hours: 0, SalesCountLast24Hours: 0 };

                return res.status(200).json({
                    success: true,
                    data: {
                        AllTimeSalesVolume: allTimeSalesVolume,
                        SalesVolumeLast24Hours,
                        SalesCountLast24Hours
                    }
                });
            } catch (error) {
                res.status(400).json({ success: false, data: error.message });
            }
            break;
    }
}
