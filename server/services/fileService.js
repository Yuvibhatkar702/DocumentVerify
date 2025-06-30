const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class FileService {
  async processImage(inputPath, outputPath, options = {}) {
    try {
      const {
        width = 1200,
        height = 1600,
        quality = 90,
        format = 'jpeg'
      } = options;

      await sharp(inputPath)
        .resize(width, height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  async getFileMetadata(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath).toLowerCase();
      
      let metadata = {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: extension
      };

      // Get image metadata if it's an image
      if (['.jpg', '.jpeg', '.png'].includes(extension)) {
        try {
          const imageMetadata = await sharp(filePath).metadata();
          metadata.image = {
            width: imageMetadata.width,
            height: imageMetadata.height,
            format: imageMetadata.format,
            channels: imageMetadata.channels,
            density: imageMetadata.density
          };
        } catch (error) {
          console.error('Failed to get image metadata:', error);
        }
      }

      return metadata;
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw new Error('Failed to read file metadata');
    }
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return true;
    } catch (error) {
      console.error('Failed to create directory:', error);
      return false;
    }
  }

  async copyFile(sourcePath, destPath) {
    try {
      await fs.copyFile(sourcePath, destPath);
      return true;
    } catch (error) {
      console.error('Failed to copy file:', error);
      return false;
    }
  }

  async moveFile(sourcePath, destPath) {
    try {
      await fs.rename(sourcePath, destPath);
      return true;
    } catch (error) {
      console.error('Failed to move file:', error);
      return false;
    }
  }

  generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    return `${baseName}-${timestamp}-${random}${extension}`;
  }

  getFileType(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    
    const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const documentTypes = ['.pdf', '.doc', '.docx', '.txt'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (documentTypes.includes(extension)) return 'document';
    
    return 'unknown';
  }

  async validateFileIntegrity(filePath) {
    try {
      const stats = await fs.stat(filePath);
      
      // Check if file exists and has size
      if (!stats.isFile() || stats.size === 0) {
        return false;
      }

      // For images, try to read metadata to ensure it's valid
      const extension = path.extname(filePath).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(extension)) {
        try {
          await sharp(filePath).metadata();
        } catch (error) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new FileService();
