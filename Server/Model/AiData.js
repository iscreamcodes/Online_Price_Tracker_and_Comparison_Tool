import mongoose from "mongoose";

const AiDataSchema = new mongoose.Schema({
    Listing_id: { type: mongoose.Schema.Types.ObjectId, ref: "Listings", required: true },
    Ai_Text_Embeddings: [{ type: Number }], // array of floats
    Ai_Last_Updated: { type: Date, default: Date.now },
  });
  
  export default mongoose.model("AI_Data", AiDataSchema);
  