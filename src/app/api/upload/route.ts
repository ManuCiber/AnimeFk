import cloudinary from "@/lib/cloudinary";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try{
        const {userId} = await auth()
        if(!userId) {
            return NextResponse.json({error: "Unathorized"}, {status: 401})
        }
        const formData = await req.formData()
        const file = formData.get('file') as File

        if(!file) {
            return NextResponse.json({error: 'No file provided'}, {status: 400})
        }

        //Validación del tipo de imagen
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if(!validTypes.includes(file.type)){
            return NextResponse.json(
                {error: "Invalid flie type. Only Images allowed."},
                {status: 400}
            )
        }

        //Validar tamaño (10MB max)
        const maxSize = 10*1024*1024
        if(file.size > maxSize){
            return NextResponse.json(
                {error: "File too large. Maximum 10MB."},
                {status: 400}
            )
        }
        // Pasamos la imagen a buffer:
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        //Subir a Cloudinary
        const result = await new Promise<any>((resolve, reject)=> {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: 'pinterest-clone',
                resource_type: 'auto',
                transformation:[
                    {with:1000, crop: 'limit'},
                    {quality: 'auto'},
                    {fetch_format: 'auto'}
                ],
                tags: [userId],
            },(error, result) => {
                if(error) reject (error)
                else resolve(result)
            })
            uploadStream.end(buffer)
        })

        return NextResponse.json(
            {
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                with: result.with,
                height: result.height
            }
        )

    } catch(error) {
        console.error('Upload error: ', error)
        return NextResponse.json({error: 'Error uploading file'}, {status: 500})
    }
}