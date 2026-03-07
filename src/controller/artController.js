import artService from "../services/artService.js";

const getArt= async(req, res) => {
  try {
    const arts= await artService.getarts(req.query);
    res.status(200).json(arts);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
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
export default {getArt, getArtById, Createart,  deleteArt,UpdateArt};