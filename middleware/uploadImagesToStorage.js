const supabase = require("../config/storageConnection")

const dotenv = require("dotenv");
dotenv.config();

const uploadFileToStorage = async (fileBuffer, fileName, folder, mimeType) => {
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .upload(`${folder}/${fileName}`, fileBuffer, { contentType: mimeType });

    if (error) throw error;

    return supabase.storage.from(process.env.SUPABASE_BUCKET_NAME).getPublicUrl(`${folder}/${fileName}`).data.publicUrl;
};

module.exports = uploadFileToStorage;