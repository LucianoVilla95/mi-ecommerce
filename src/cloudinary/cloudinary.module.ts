import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryConfig } from 'src/config/cloudinary';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [CloudinaryService, CloudinaryConfig],
  exports: [CloudinaryService, 'CLOUDINARY']
})
export class CloudinaryModule {}