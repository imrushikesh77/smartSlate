import {aiChat} from "../utils/chatGemini.js"

const postCalculate = async(req,res) => {
    const { image, dict_of_vars } = req.body;
    const aiReply = await aiChat(dict_of_vars,image);

    if(aiReply.Error) {
        return res.status(500).json({Error : aiReply.Error});
    }

    return res.status(200).json({result: aiReply.result});
}

const getHealth = async(req,res) => {
    try {
        return res.send("Everything is ok!!");      
    } catch (error) {
        console.log(error.message);
    }
}


export {
    postCalculate,
    getHealth
}