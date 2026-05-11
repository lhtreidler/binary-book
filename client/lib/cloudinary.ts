const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(
  localUri: string,
  mimeType = "image/jpeg",
): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
  console.log({ url });
  const formData = new FormData();
  console.log({ UPLOAD_PRESET });
  formData.append("upload_preset", UPLOAD_PRESET!);
  formData.append("file", {
    uri: localUri,
    type: mimeType,
    name: "photo.jpg",
  } as unknown as Blob);

  const response = await fetch(url, { method: "POST", body: formData });

  if (!response.ok) {
    console.log(response);
    throw new Error(`Cloudinary upload failed: ${response.status}`);
  }

  const data = await response.json();
  return data.secure_url as string;
}
