import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import NFT from "../../../Models/NFT";
import Notification from "../../../Models/Notification";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "GET":
                try {
                    const { user, skip } = req.query;
                    let notifiQuery = {};

                    if (user != "") {
                        notifiQuery.user = user
                    }

                    const notifications = await Notification.find(notifiQuery)
                        .populate({
                            path: "nft",
                            select: { nft_image: 1, name: 1, NFTAddress: 1 },
                        })
                        .skip(skip)
                        .limit(15)
                        .sort({ createdAt: -1 });

                    // Fetch fromUser information for each notification
                    const notificationsWithFromUser = [];
                    for (const notification of notifications) {
                        const fromUser = await User.findOne({ wallet_id: notification.soldTo });
                        if (fromUser) {
                            notificationsWithFromUser.push({
                                ...notification.toObject(),
                                fromUser: fromUser.user_name,
                            });
                        }
                    }

                    return res.status(200).json({ success: true, data: notificationsWithFromUser });

                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
                break;
            case "POST":
                try {
                    const { notificationId } = req.body;

                    let notification = await Notification.findOne({ _id: notificationId });
                    if (!notification)
                        return res
                            .status(400)
                            .json({ success: false, data: "Cannot Find This Notification" });

                    await Notification.deleteOne({ _id: notificationId });

                    return res.status(200).json({ success: true, data: "Successfully deleted Notification" });
                } catch (error) {
                    res.status(400).json({ success: false, data: error.message });
                }
                break;
            default:
                res.status(400).json({ success: false });
                break;
        }
    });
}
