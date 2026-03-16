import videoService from "../services/videoService.js";

const getVideo = async(req, res) => {
  try {
    const videos = await videoService.getVideos(req.query);
    res.status(200).json(videos);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const getVideoById = async(req,res)=>{
  try {
    const id = req.params.id;
    const video = await videoService.getVideoById(id);
    res.json(video);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const createVideo = async (req, res) => {
  try{
    const data = await videoService.createVideo(
      req.body,
      req.files,
      req.user
    );

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(error.statusCode || 500).send(error.message);
  }
};

const updateVideo = async(req,res)=>{
  const id = req.params.id;
  try{
    const data = await videoService.updateVideo(id, req.body, req.files, req.user);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const deleteVideo = async(req,res)=>{
  const id = req.params.id;
  const user = req.user;
  try{
    const data = await videoService.deleteVideo(id, user);
    res.json({ message: `Video deleted successfully with id: ${id}`, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const reactToVideo = async(req,res)=>{
  const id = req.params.id;
  try{
    const data = await videoService.reactToVideo(id, req.user);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const viewVideo = async(req,res)=>{
  const id = req.params.id;
  try{
    const data = await videoService.viewVideo(id);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export default {getVideo, getVideoById, createVideo, updateVideo, deleteVideo, reactToVideo, viewVideo};