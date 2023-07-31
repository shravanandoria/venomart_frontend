import dbConnect from "@/lib/dbConnect";
import Launchpad from "../../Models/Launchpad";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      const launchpads = await Launchpad.find();
      res.status(200).json({ success: true, data: launchpads });
      break;
    case "POST":
      const { lauchpad_id, name } = req.body;
      const lauchpad = await Launchpad.findById(lauchpad_id);

      if (!lauchpad) {
        const new_launchpad = await Launchpad.create({
          name,
        });

        res.status(201).json({ success: true, data: new_launchpad });
      }

      res.status(201).json({ success: true, data: lauchpad });

      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
