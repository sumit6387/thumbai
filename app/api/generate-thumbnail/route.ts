import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { GoogleGenAI, Modality } from "@google/genai";
import { join } from 'path'
import * as fs from "node:fs";


export async function POST(request: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, });
    const formData = await request.formData()
    const image = formData.get('image') as File
    const prompt = formData.get('prompt') as string
    const previousImage = formData.get('previousImage') as string
    const previousImage1 = formData.get('previousImage1') as string
    const previousImage2 = formData.get('previousImage2') as string
    const previousImage3 = formData.get('previousImage3') as string

    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Please upload an image under 10MB.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      console.error('Error creating uploads directory:', error)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = image.name.split('.').pop() || 'jpg'
    const filename = `upload_${timestamp}.${fileExtension}`
    const filepath = join(uploadsDir, filename)
    const geminiImage = `upload_${timestamp}_gemini-native-image.png`
    const geminiImagePath = join(uploadsDir, geminiImage)

    // Convert File to Buffer and save to disk
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let bufferPreviousImage = null;
    let usedPreviousImage = null;
    
    // Try to find the first available previous image for fallback
    if (previousImage && fs.existsSync(join(uploadsDir, previousImage))) {
      bufferPreviousImage = fs.readFileSync(join(uploadsDir, previousImage));
      usedPreviousImage = previousImage;
      console.log('Using primary previous image:', previousImage);
    } else if (previousImage1 && fs.existsSync(join(uploadsDir, previousImage1))) {
      bufferPreviousImage = fs.readFileSync(join(uploadsDir, previousImage1));
      usedPreviousImage = previousImage1;
      console.log('Using fallback image 1:', previousImage1);
    } else if (previousImage2 && fs.existsSync(join(uploadsDir, previousImage2))) {
      bufferPreviousImage = fs.readFileSync(join(uploadsDir, previousImage2));
      usedPreviousImage = previousImage2;
      console.log('Using fallback image 2:', previousImage2);
    } else if (previousImage3 && fs.existsSync(join(uploadsDir, previousImage3))) {
      bufferPreviousImage = fs.readFileSync(join(uploadsDir, previousImage3));
      usedPreviousImage = previousImage3;
      console.log('Using fallback image 3:', previousImage3);
    } else {
      console.log('No previous images available for fallback');
    }

    
    try {
      await writeFile(filepath, buffer)
      console.log('Image saved successfully:', filepath)
    } catch (error) {
      console.error('Error saving image:', error)
      return NextResponse.json(
        { error: 'Failed to save image' },
        { status: 500 }
      )
    }

    const SYSTEM_PROMPT = `
        You are a helpful assistant that enhances user queries to make them clear, detailed, and precise while preserving the original intent. Your enhanced prompts should be tailored specifically for generating high-quality, realistic thumbnails using the Gemini image preview model.

        When enhancing, add vivid descriptive elements such as:
        - Visual details about subjects and environment
        - Lighting and atmosphere (e.g., golden hour, dramatic shadows)
        - Camera and lens specifics (e.g., focal length, depth of field, bokeh)
        - Composition and orientation (e.g., close-up, portrait, wide-angle)
        - Mood or emotional tone (e.g., serene, energetic, mysterious)
        - Material textures, colors, and any relevant contextual info
        - Additionally, include subtle, relevant image icons or elements softly integrated into the background to make the thumbnail appear more realistic and visually rich. These background details should complement but not overpower the main subject.

        Also:
        - Remove the background from the source image to isolate the main subject.
        - Use this isolated subject image as the primary visual element for the thumbnail.
        - Harmoniously blend the isolated subject with the enhanced textual prompt and added background icons.


        Example enhanced prompt:
        "A photorealistic close-up portrait of an elderly Japanese ceramicist with deep, sun-etched wrinkles and a warm, knowing smile. He is carefully inspecting a freshly glazed tea bowl. The setting is his rustic, sun-drenched workshop. The scene is illuminated by soft, golden hour light streaming through a window, highlighting the fine texture of the clay. Captured with an 85mm portrait lens, resulting in a soft, blurred background (bokeh). The overall mood is serene and masterful. Vertical portrait orientation."

        Now, enhance the following user query into a detailed, vivid prompt for thumbnail generation that includes isolated subject image and subtle background icons to enhance realism:

        Query: "${prompt}"
    `

    const responseData = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: SYSTEM_PROMPT,
      });

      const enhancedQuery = responseData.text;

    // TODO: Integrate with your AI thumbnail generation service
    const base64Image = buffer.toString("base64");
    let base64PreviousImage = null;
    if(bufferPreviousImage){
        base64PreviousImage = bufferPreviousImage.toString("base64");
    }

    const geminiPrompt: any = [
        { text: `
            You are a helpful assistant that enhances user queries to make them clear, detailed, and precise while preserving the original intent. Your enhanced prompts should be tailored specifically for generating high-quality images or thumbnails using the Gemini image preview model.

                When enhancing, add vivid descriptive elements such as:
                - Visual details about subjects and environment
                - Lighting and atmosphere (e.g., golden hour, dramatic shadows)
                - Camera and lens specifics (e.g., focal length, depth of field, bokeh)
                - Composition and orientation (e.g., close-up, portrait, wide-angle)
                - Mood or emotional tone (e.g., serene, energetic, mysterious)
                - Material textures, colors, and any relevant contextual info

                Additionally, before generating the thumbnail:
                - Remove the background from the source image to isolate the main subject.
                - Use this isolated subject image as the primary visual element for the thumbnail.
                - Ensure the thumbnail visually integrates the isolated subject with the enhanced prompt details harmoniously.

                Example enhanced prompt:
                "A photorealistic close-up portrait of an elderly Japanese ceramicist with deep, sun-etched wrinkles and a warm, knowing smile. He is carefully inspecting a freshly glazed tea bowl. The setting is his rustic, sun-drenched workshop. The scene is illuminated by soft, golden hour light streaming through a window, highlighting the fine texture of the clay. Captured with an 85mm portrait lens, resulting in a soft, blurred background (bokeh). The overall mood is serene and masterful. Vertical portrait orientation."
                "Using the provided image of a living room, change only the blue sofa to be a vintage, brown leather chesterfield sofa. Keep the rest of the room, including the pillows on the sofa and the lighting, unchanged."

                Now, enhance the following user query into a detailed, vivid prompt for image or thumbnail generation, incorporating the isolated subject image after background removal:


                Query: "${prompt}"
            
            ` },
        {
          inlineData: {
            mimeType: "image/png",
            data: base64PreviousImage ? base64PreviousImage : base64Image,
          },
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: geminiPrompt,
      });

      if (!response?.candidates?.[0]?.content?.parts) {
        throw new Error('Invalid response from Gemini API');
      }

      let responsePromptData = "";
      let isImageGenerated = false;

      console.log(JSON.stringify(response, null, 2));
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
            console.log("Gemini Prompt:")
          console.log(part.text);
          responsePromptData += part.text;
        } else if (part.inlineData?.data) {
          console.log("Gemini Image:")
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          fs.writeFileSync(geminiImagePath, buffer);
          isImageGenerated = true;
          console.log("Image saved as gemini-native-image.png");
        }
      }

    // For now, we'll return a mock response with the saved file path
    console.log('Received request:', {
      fileName: image.name,
      fileSize: image.size,
      fileType: image.type,
      prompt: prompt,
      previousImage: previousImage || 'None',
      previousImage1: previousImage1 || 'None',
      previousImage2: previousImage2 || 'None',
      previousImage3: previousImage3 || 'None',
      usedPreviousImage: usedPreviousImage || 'None',
      savedPath: filepath,
      geminiImagePath: isImageGenerated ? geminiImage : null,
      responsePromptData: responsePromptData
    })
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      thumbnailUrl: "",
      uploadedImageUrl: `/uploads/${filename}`,
      uploadedImagePath: filepath,
      geminiImageUrl: process.env.APP_URL+"/uploads/"+geminiImage,
      geminiImagePath: isImageGenerated ? geminiImage : null,
      usedPreviousImage: usedPreviousImage,
      responsePromptData: responsePromptData,
      message: 'Thumbnail generated successfully'
    })

  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint only accepts POST requests' },
    { status: 400 }
  )
}
