import dbConnect from "../../../lib/dbConnect";
import User from "../../../Models/User";
import Collection from "../../../Models/Collection";
import Activity from "../../../Models/Activity";
import Notification from "../../../Models/Notification";
import NFT from "../../../Models/NFT";
import limiter from "../limiter";

export default async function handler(req, res) {
    const { method } = req;
    await dbConnect();

    limiter(req, res, async () => {
        switch (method) {
            case "POST":
                try {
                    const { user_id, user_wallet, collection_id, nft_id, activityType, skip } = req.body;
                    let activityQuery = {};

                    if (user_id) {
                        if (activityType == "user_sale") {
                            activityQuery.type = "sale";
                            activityQuery.from = user_wallet;
                        }
                        else if (activityType == "sale") {
                            activityQuery.to = user_wallet;
                            activityQuery.type = "sale";
                        }
                        else {
                            activityQuery.owner = user_id;
                            activityType && (activityQuery.type = activityType);
                        }
                    } else if (collection_id) {
                        activityQuery.nft_collection = collection_id;
                        activityType && (activityQuery.type = activityType);
                    } else if (nft_id) {
                        activityQuery.item = nft_id;
                        activityType && (activityQuery.type = activityType);
                    }
                    else {
                        activityType && (activityQuery.type = activityType);
                    }

                    if (activityType == "user_sale") {
                        const activities = await Activity.find(activityQuery)
                            .populate({
                                path: "item",
                                select: { attributes: 0, createdAt: 0, updatedAt: 0 },
                            })
                            .skip(skip)
                            .limit(15)
                            .sort({ createdAt: -1 });

                        return res.status(200).json({ success: true, data: activities });
                    }

                    const activities = await Activity.find(activityQuery)
                        .populate({
                            path: "item",
                            select: { attributes: 0, createdAt: 0, updatedAt: 0 },
                        })
                        .skip(skip)
                        .limit(15)
                        .sort({ createdAt: -1 });

                    // Fetch fromUser and ToUser information for each activity
                    const activityWithUserInfo = [];
                    for (const activity of activities) {
                        let fromUser = "";
                        let toUser = "";

                        const fetchFromUser = await User.findOne({ wallet_id: activity.from });
                        if (fetchFromUser != null) {
                            fromUser = fetchFromUser;
                        }
                        const fetchToUser = await User.findOne({ wallet_id: activity.to });
                        if (fetchToUser != null) {
                            toUser = fetchToUser;
                        }

                        activityWithUserInfo.push({
                            ...activity.toObject(),
                            fromUser: fromUser.user_name,
                            toUser: toUser.user_name,
                        });
                    }

                    return res.status(200).json({ success: true, data: activityWithUserInfo });

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
