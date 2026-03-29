import musicService from "../services/musicService.js";

const getMusic = async(req, res) => {
  try {
    const musics = await musicService.getMusics(req.query);
    res.status(200).json(musics);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const getMusicById = async(req,res)=>{
  try {
    const id = req.params.id;
    const music = await musicService.getMusicById(id);
    res.json(music);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const createMusic = async (req, res) => {
  try{
    const data = await musicService.createMusic(
      req.body,
      req.files,
      req.user
    );

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating music:", error);
    res.status(error.statusCode || 500).send(error.message);
  }
};

const updateMusic = async(req,res)=>{
  const id = req.params.id;
  try{
    const data = await musicService.updateMusic(id, req.body, req.files, req.user);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const deleteMusic = async(req,res)=>{
  const id = req.params.id;
  const user = req.user;
  try{
    const data = await musicService.deleteMusic(id, user);
    res.json({ message: `Music deleted successfully with id: ${id}`, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const reactToMusic = async(req,res)=>{
  const id = req.params.id;
  try{
    const data = await musicService.reactToMusic(id, req.user);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const viewMusic = async(req,res)=>{
  const id = req.params.id;
  try{
    const data = await musicService.viewMusic(id);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getMusicCount = async(req, res) => {
  try {
    const count = await musicService.countMusics(req.query);
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
    const data = await musicService.addComment(id, userId, username, text);
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
    const data = await musicService.deleteComment(id, commentId, userId);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getGenres = async(req, res) => {
  try {
    const genres = await musicService.getGenres();
    res.status(200).json(genres);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export default {getMusic, getMusicById, createMusic, updateMusic, deleteMusic, reactToMusic, viewMusic, getMusicCount, addComment, deleteComment, getGenres};
