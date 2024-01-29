const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
app.use(express.json());
app.use(cors());

const apiKey = "acc_4aa4e669bb8b3fa";
const apiSecret = "fa1e722ff66a8fc3870dc7eab9c9f785";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "/tmp"); // Update the destination directory
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}.jpg`); // Set the file name and extension
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.status(200).send("You can post to /api/upload.");
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "Please upload a file." });
  console.log("file.path is:", file.path);

  try {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(file.path));

    const imaggaResponse = await axios.post("https://api.imagga.com/v2/tags", formData, {
      auth: {
        username: apiKey,
        password: apiSecret,
      },
      headers: {
        ...formData.getHeaders(),
      },
    });

    const data = imaggaResponse.data; // Get the data from the response
    console.log("data:", data);

    return res.status(200).json({
      message: "success!",
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "fail!",
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running at http://localhost:${process.env.PORT || 3000}`);
});
