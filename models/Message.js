import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: String,            
            required: true
        },

        receiver: {
            type: String,
            required: true        
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;