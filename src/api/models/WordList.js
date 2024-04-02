import mongoose from "mongoose";

const WordListSchema = new mongoose.Schema({
    Category: {
        type: String,
        required: true,
    },
    Words: {
        type: Array,
        required: true,
    },
});

const WordList = mongoose.model("WordList", WordListSchema, "WordList");

export default WordList;