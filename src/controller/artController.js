import artService from "../services/artService.js";

const getArt= async(req, res) => {
  try {
    const arts= await artService.getarts(req.query);
    res.status(200).json(arts);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const getBrands = async(req, res) => {
  const brands= await artService.getBrands();
  res.status(200).json(brands);
};

const getCategories = async(req, res) => {
  const categories= await artService.getCategories();
  res.status(200).json(categories);
};
const getArtById= async(req,res)=>{
  try {
    const id = req.params.id;  
    const Art = await artService.getArtById(id);
    res.json(Art);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};



const Createart = async (req, res) => {
  try{
    const data = await artService.createArt(
      req.body,
      req.files,
      req.user
    );

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating art:", error);
    res.status(error.statusCode || 500).send(error.message);
  }

}



const UpdateArt= async(req,res)=>{
  const id = req.params.id;
  try{
    const data = await artService.updateArt(id, req.body, req.files, req.user);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

const deleteArt= async(req,res)=>{
  const id = req.params.id;
  const user = req.user;
  try{
    const data = await artService.deleteArt(id, user);
    res.json({ message: `Art deleted successfully with id: ${id}`, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
const reactToArt = async(req,res)=>{
  const id = req.params.id;
  try{
    const data = await artService.reactToArt(id, req.user);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const viewArt = async(req,res)=>{
  const id = req.params.id;
  try{
    const data = await artService.viewArt(id);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const getArtCount = async(req, res) => {
  try {
    const count = await artService.countarts(req.query);
    res.status(200).json(count);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  const id = req.params.id;
  const { text } = req.body;
  const { _id: userId, username } = req.user;
  try {
    const data = await artService.addComment(id, userId, username, text);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  const id = req.params.id;
  const commentId = req.params.commentId;
  const userId = req.user._id.toString();
  try {
    const data = await artService.deleteComment(id, commentId, userId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export default {getArt, getArtById, Createart,  deleteArt,UpdateArt, reactToArt, viewArt, getBrands, getCategories, getArtCount, addComment, deleteComment};