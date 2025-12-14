import Alert from "../Model/Alert.js";
import Product from "../Model/Products.js";

// CREATE ALERT
export async function createAlert(req, res) {
  try {
    const { alert_productId, alert_type, alert_triggerPrice } = req.body;

    const newAlert = await Alert.create({
      alert_userId: req.user._id,
      alert_productId,
      alert_type,
      alert_triggerPrice,
    });

    res.status(201).json({ message: "Alert created", alert: newAlert });
  } catch (err) {
    console.error("Create alert error:", err);
    res.status(500).json({ error: "Failed to create alert" });
  }
}

// GET ALL ALERTS FOR USER
export async function getAlerts(req, res) {
  try {
    const alerts = await Alert.find({ alert_userId: req.user._id })
      .populate("alert_productId");

    res.json(alerts);
  } catch (err) {
    console.error("Fetch alerts error:", err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
}

// DELETE ALERT
export async function deleteAlert(req, res) {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete alert" });
  }
}
