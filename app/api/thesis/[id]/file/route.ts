import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
import { Thesis } from '@/lib/models/Thesis';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDatabase();
    const { id } = await params;

    const thesis = await Thesis.findById(id);
    if (!thesis || !thesis.file_path) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    let filePath = thesis.file_path;
    
    // Path resolution logic
    if (fs.existsSync(filePath)) {
        // Exists as is
    } else {
        const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const projectPath = path.join(process.cwd(), relativePath);
        
        if (fs.existsSync(projectPath)) {
            filePath = projectPath;
        } else {
            const publicPath = path.join(process.cwd(), 'public', filePath);
            if (fs.existsSync(publicPath)) {
                filePath = publicPath;
            } else {
                 console.error(`File not found at: ${filePath}, ${projectPath}, or ${publicPath}`);
                 return NextResponse.json({ success: false, error: 'File does not exist on server' }, { status: 404 });
            }
        }
    }

    const fileBuffer = fs.readFileSync(filePath);
    const stat = fs.statSync(filePath);
    const filename = path.basename(filePath);
    const encodedFilename = encodeURIComponent(filename);

    let finalBuffer = fileBuffer;
    let finalSize = stat.size;

    // --- Watermark Logic ---
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const { width, height } = pages[0].getSize();
      
      const watermarkText = `Copyright © ${new Date().getFullYear()} Management Thesis System`;
      const dateText = `Downloaded: ${new Date().toLocaleDateString('en-GB')}`;
      
      // Main diagonal watermark
      const fontSize = 24;
      const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
      const textHeight = helveticaFont.heightAtSize(fontSize);
      
      // Calculate centered position for rotated text
      const angle = 45;
      const rad = angle * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      pages.forEach(page => {
        const { width, height } = page.getSize();
        
        // Center of the page
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Center of the text relative to its baseline origin
        // Visual vertical center is roughly 1/3 of font size above baseline
        const textCenterX = textWidth / 2;
        const textCenterY = fontSize / 3; 

        // Rotate the text center vector to find offset
        const rotatedDistX = textCenterX * cos - textCenterY * sin;
        const rotatedDistY = textCenterX * sin + textCenterY * cos;

        // Calculate start coordinates
        const x = centerX - rotatedDistX;
        const y = centerY - rotatedDistY;

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0.6, 0.6, 0.6), 
          opacity: 0.25, 
          rotate: degrees(angle),
        });
        
        // Footer watermark
        page.drawText(`${dateText} - For Educational Use Only`, {
            x: 20,
            y: 20,
            size: 9,
            font: helveticaFont,
            color: rgb(0.4, 0.4, 0.4),
            opacity: 0.6,
        });
      });

      const pdfBytes = await pdfDoc.save();
      finalBuffer = Buffer.from(pdfBytes);
      finalSize = finalBuffer.length;

    } catch (watermarkError) {
      console.error("Watermark failed, serving original file:", watermarkError);
      // Fallback to original fileBuffer is automatic since we didn't update finalBuffer
    }
    // -----------------------

    return new NextResponse(finalBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': finalSize.toString(),
        'Content-Disposition': `inline; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });

  } catch (error) {
    console.error("File API Error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
