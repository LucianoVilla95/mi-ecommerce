import { Test, TestingModule } from "@nestjs/testing";
import { ProductsBodyDto } from "./dtos/productsBodyDto.dto";
import { ProductsService } from "./products.service";
import { ProductsRepository } from "./products.repository";
import { CategoriesService } from "../categories/categories.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Product } from "./products.entity";
import { Category } from "../categories/categories.entity";
import { OrderDetail } from "../orders/orderDetails.entity";
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ProductsQueryDto } from "./dtos/productsQueryDto.dto";
import { ProductsUpdateDto } from "./dtos/productsUpdateDto.dto";

describe('ProductsService', () => {
  let productsService: ProductsService;
  let mockProductsRepository: Partial<ProductsRepository> & {
    getProductByName: jest.Mock;
    createProduct: jest.Mock;
    getProducts: jest.Mock;
    searchByName: jest.Mock;
    getProductById: jest.Mock;
    updateProduct: jest.Mock;
    deleteProduct: jest.Mock;
    updateStock: jest.Mock;
  };
  let mockCategoriesService: Partial<CategoriesService> & {
    getCategoryById: jest.Mock;
  };
  let mockCloudinaryService: Partial<CloudinaryService> & {
    uploadImage: jest.Mock;
    deleteImage: jest.Mock;
  };

  const mockProductDto: Omit<ProductsBodyDto, 'file'> = {
    name: 'Samsung Galaxy S23',
    description: 'The best smartphone in the world',
    price: 199.99,
    stock: 218,
    isActive: true,
    categoryId: 'cf351759-bf58-40de-9ab3-48deed6abaa9'
  }

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'product.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('archivo-simulado'),
    size: 16,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  }

  const mockCategory: Category = {
    id: 'cf351759-bf58-40de-9ab3-48deed6abaa9',
    name: 'smartphone',
    imgUrl: "https://res.cloudinary.com/dd1jietna/image/upload/v1779085871/r0obtbmjuwaa7bqwnnqx.jpg",
    imgPublicId: "r0obtbmjuwaa7bqwnnqx",
    slug: "smartphone",
    products: [] as Product[]
  };

  const mockUploadedImage = {
    secure_url: "https://res.cloudinary.com/dd1jietna/image/upload/v1775186405/aq1jinrinxuptgdq4sqm.jpg",
    public_id: "aq1jinrinxuptgdq4sqm"
  };

  const mockCreatedProduct: Product = {
    id: '120e03c0-c066-4a30-ab02-dec0ae4909bd',
    name: mockProductDto.name,
    description: mockProductDto.description,
    price: mockProductDto.price,
    stock: mockProductDto.stock,
    imgUrl: mockUploadedImage.secure_url,
    imgPublicId: mockUploadedImage.public_id,
    slug: 'samsung-galaxy-s23',
    isActive: true,
    orderDetails: [] as OrderDetail[],
    category: mockCategory,
  };

  // Producto simulado con la estructura que mapea tu método
  const mockProduct: Product[] = [
    {
      id: 'fd8aa7f6-0a15-418c-b8ab-22f2ecfc6f16',
      name: 'Samsung Galaxy S23',
      description: 'The best smartphone',
      price: 199.99,
      stock: 218,
      imgUrl: 'http://image.jpg',
      imgPublicId: 'prod_123',
      slug: 'samsung-galaxy-s23',
      isActive: true,
      category: mockCategory,
      orderDetails: [] as OrderDetail[]
    },
    {
      id: '3b5c92da-6f4e-41d8-bd2d-ea7362a9b207',
      name: 'Motorola Edge 40',
      description: 'The best smartphone',
      price: 199.99,
      stock: 218,
      imgUrl: 'http://image.jpg',
      imgPublicId: 'prod_123',
      slug: 'motorola-edge-40',
      isActive: true,
      category: mockCategory,
      orderDetails: [] as OrderDetail[]
    }
  ];

  beforeEach(async () => {
    mockProductsRepository = {
      getProductByName: jest.fn(),
      createProduct: jest.fn(),
      getProducts: jest.fn(),
      searchByName: jest.fn(),
      getProductById: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      updateStock: jest.fn(),
    }

    mockCategoriesService = {
      getCategoryById: jest.fn(),
    }

    mockCloudinaryService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService
        }
      ]
    }).compile();
    productsService = module.get<ProductsService>(ProductsService);

    jest.clearAllMocks();
  });

  it('Create an instance of ProductsService', async () => {  
    expect(productsService).toBeDefined();
  });

  describe('createProduct', () => {

    it('should successfully create a product and return it', async () => {
      // 1. Configurar los mocks para el camino feliz
      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockProductsRepository.getProductByName.mockResolvedValue(null); // No existe duplicado
      mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadedImage);
      mockProductsRepository.createProduct.mockResolvedValue(mockCreatedProduct);

      // 2. Ejecutar el método
      const result = await productsService.createProduct(mockProductDto as ProductsBodyDto, mockFile);

      // 3. Verificaciones de resultado y llamadas
      expect(result).toEqual(mockCreatedProduct);
      expect(mockCategoriesService.getCategoryById).toHaveBeenCalledWith(mockProductDto.categoryId);
      expect(mockProductsRepository.getProductByName).toHaveBeenCalledWith(mockProductDto.name);
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(mockFile);
      
      // Verifica que el repositorio reciba los argumentos correctos mapeados (incluyendo el slug generado)
      expect(mockProductsRepository.createProduct).toHaveBeenCalledWith(
        mockProductDto.name,
        mockProductDto.description,
        mockProductDto.price,
        mockProductDto.stock,
        mockUploadedImage.secure_url,
        mockUploadedImage.public_id,
        'samsung-galaxy-s23', // Resultado esperado de slugify
        mockCategory
      );
    });

    it('should throw ConflictException if product name already exists', async () => {
      // Configurar para que el producto ya exista
      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockProductsRepository.getProductByName.mockResolvedValue(mockCreatedProduct);

      // Ejecutar y verificar la excepción
      await expect(productsService.createProduct(mockProductDto as ProductsBodyDto, mockFile)).rejects.toThrow(new ConflictException('Product already exists'));

      // Asegurar que el flujo se cortó y no subió imagen ni guardó en repositorio
      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(mockProductsRepository.createProduct).not.toHaveBeenCalled();
    });

    it('should rethrow HttpException if any internal service throws it', async () => {
      // Forzar que el servicio de categorías lance un error HTTP controlado (ej. NotFoundException)
      const mockNotFoundError = new NotFoundException('Category not found');
      mockCategoriesService.getCategoryById.mockRejectedValue(mockNotFoundError);

      await expect(productsService.createProduct(mockProductDto as ProductsBodyDto, mockFile)).rejects.toThrow(mockNotFoundError);
    });

    it('should throw InternalServerErrorException when an unexpected error occurs', async () => {
      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockProductsRepository.getProductByName.mockResolvedValue(null);
      
      // Forzar un error nativo de JavaScript/base de datos que no sea HttpException
      mockCloudinaryService.uploadImage.mockRejectedValue(new Error('Cloudinary connection timeout'));

      await expect(productsService.createProduct(mockProductDto as ProductsBodyDto, mockFile)).rejects.toThrow(new InternalServerErrorException('Error creating product'));
    });
  });

  describe('getProducts', () => {

    it('should return paginated products with explicit query parameters', async () => {
      const queryDto: ProductsQueryDto = { page: 2, limit: 5 };
      const totalItems: number = 12;
      // Tu repositorio devuelve una tupla [Product[], total]
      mockProductsRepository.getProducts.mockResolvedValue([mockProduct, totalItems]);

      const result = await productsService.getProducts(queryDto);

      // Verificaciones del resultado estructurado
      expect(result).toEqual({
        data: mockProduct,
        meta: {
          total: totalItems,
          currentPage: 2,
          lastPage: 3 // Math.ceil(12 / 5) = 3
        }
      });

      // Verificación de los argumentos enviados al repositorio: pageSize = 5, skip = (2 - 1) * 5 = 5
      expect(mockProductsRepository.getProducts).toHaveBeenCalledWith(5, 5);
    });

    it('should use default values (page 1, limit 10) when query parameters are missing or 0', async () => {
      const queryDto: ProductsQueryDto = { page: 0, limit: 0 };
      const totalItems: number = 5;
      mockProductsRepository.getProducts.mockResolvedValue([mockProduct, totalItems]);

      const result = await productsService.getProducts(queryDto);

      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.lastPage).toBe(1); // Math.ceil(5 / 10) = 1
      
      // Verificación de fallback: pageSize = 10, skip = (1 - 1) * 10 = 0
      expect(mockProductsRepository.getProducts).toHaveBeenCalledWith(10, 0);
    });

    it('should cap the limit at 100 products maximum due to Math.min protection', async () => {
      const queryDto: ProductsQueryDto = { page: 1, limit: 150 };
      mockProductsRepository.getProducts.mockResolvedValue([mockProduct, 1]);

      await productsService.getProducts(queryDto);

      // Verifica que el repositorio reciba 100 en lugar de 150
      expect(mockProductsRepository.getProducts).toHaveBeenCalledWith(100, 0);
    });

    it('should throw a generic Error if the repository fails', async () => {
      const queryDto: ProductsQueryDto = { page: 1, limit: 10 };
      
      // Forzamos un error en la base de datos o repositorio
      mockProductsRepository.getProducts.mockRejectedValue(new Error('DB connection failed'));

      // Tu método atrapa el error y lanza un "new Error('Could not get products at this time')"
      await expect(productsService.getProducts(queryDto)).rejects.toThrow('Could not get products at this time');
    });
  });
  
  describe('getProductById', () => {
    // Simulamos un EntityManager de TypeORM (puede ser un objeto vacío o parcial)
    const mockEntityManager: any = {};

    it('should successfully return a product when it exists without a manager', async () => {
      mockProductsRepository.getProductById.mockResolvedValue(mockCreatedProduct);

      const result = await productsService.getProductById(mockCreatedProduct.id);

      expect(result).toEqual(mockCreatedProduct);
      expect(mockProductsRepository.getProductById).toHaveBeenCalledWith(mockCreatedProduct.id, undefined);
    });

    it('should successfully pass the EntityManager to the repository when provided', async () => {
      mockProductsRepository.getProductById.mockResolvedValue(mockCreatedProduct);

      const result = await productsService.getProductById(mockCreatedProduct.id, mockEntityManager);

      expect(result).toEqual(mockCreatedProduct);
      expect(mockProductsRepository.getProductById).toHaveBeenCalledWith(mockCreatedProduct.id, mockEntityManager);
    });

    it('should throw NotFoundException if the repository returns null', async () => {
      mockProductsRepository.getProductById.mockResolvedValue(null);

      await expect(productsService.getProductById(mockCreatedProduct.id)).rejects.toThrow(new NotFoundException('Product not found'));
    });
  });

  describe('searchProductsByName', () => {

    it('should successfully search products by separating words and return pagination format', async () => {
      const queryDto: ProductsQueryDto = { name: '  samsung   galaxy  s23  ', page: 1, limit: 10 };
      const mockRepositoryResponse = { products: mockProduct, total: 1 };
      
      mockProductsRepository.searchByName.mockResolvedValue(mockRepositoryResponse);

      const result = await productsService.searchProductsByName(queryDto);

      // 1. Verificar el resultado final estructurado
      expect(result).toEqual({
        data: mockProduct,
        meta: {
          total: 1,
          currentPage: 1,
          lastPage: 1
        }
      });

      // 2. VERIFICACIÓN CLAVE: Asegurar que dividió el string por espacios extras correctamente
      // '  samsung   galaxy  ' -> ['samsung', 'galaxy']
      expect(mockProductsRepository.searchByName).toHaveBeenCalledWith(['samsung', 'galaxy', 's23'], 1, 10);
    });

    it('should use default values for page and limit if they are not provided', async () => {
      // Mandamos solo el name en el DTO
      const queryDto: ProductsQueryDto = { name: 'iphone' };
      mockProductsRepository.searchByName.mockResolvedValue({ products: [], total: 0 });

      await productsService.searchProductsByName(queryDto as ProductsQueryDto);

      // Verifica que use page = 1 y limit = 10 por los parámetros por defecto de la firma
      expect(mockProductsRepository.searchByName).toHaveBeenCalledWith(['iphone'], 1, 10);
    });

    it('should throw BadRequestException if name is undefined, null or empty string', async () => {
      const queryDto: ProductsQueryDto = { name: '' };

      await expect(productsService.searchProductsByName(queryDto)).rejects.toThrow(new BadRequestException('Search query is required'));

      // El repositorio jamás debió ser llamado
      expect(mockProductsRepository.searchByName).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if name contains only spaces', async () => {
      const queryDto: ProductsQueryDto = { name: '    ' };

      await expect(productsService.searchProductsByName(queryDto)).rejects.toThrow(new BadRequestException('Search query is required'));

      expect(mockProductsRepository.searchByName).not.toHaveBeenCalled();
    });
  });

  describe('updateStock', () => {

    const mockEntityManager: any = { id: 'mock-manager-uuid' };
    const mockSuccessResponse = { message: 'Stock updated successfully' };

    it('should successfully update stock without an entity manager', async () => {
      mockProductsRepository.updateStock.mockResolvedValue(mockSuccessResponse);

      const result = await productsService.updateStock(mockCreatedProduct);

      expect(result).toEqual(mockSuccessResponse);
      expect(mockProductsRepository.updateStock).toHaveBeenCalledWith(mockCreatedProduct, undefined);
    });

    it('should successfully update stock passing the provided EntityManager', async () => {
      mockProductsRepository.updateStock.mockResolvedValue(mockSuccessResponse);

      const result = await productsService.updateStock(mockCreatedProduct, mockEntityManager);

      expect(result).toEqual(mockSuccessResponse);
      expect(mockProductsRepository.updateStock).toHaveBeenCalledWith(mockCreatedProduct, mockEntityManager);
    });

    it('should bubble up exceptions thrown by the repository', async () => {
      // Forzar un fallo en la base de datos (ej. error de concurrencia o bloqueo)
      mockProductsRepository.updateStock.mockRejectedValue(new Error('Database lock error'));

      await expect(productsService.updateStock(mockCreatedProduct)).rejects.toThrow('Database lock error');
    });
  });

  describe('updateProduct', () => {

    const updateDto: ProductsUpdateDto = {
      name: 'Samsung Galaxy S24',
      description: 'Updated description',
      price: 299.99,
      stock: 100,
      categoryId: 'cf351759-bf58-40de-9ab3-48deed6abaa9',
      isActive: true,
    };

    // Espiamos el método getProductById del propio servicio
    let getProductByIdSpy: jest.SpyInstance;

    beforeEach(() => {
      getProductByIdSpy = jest.spyOn(productsService, 'getProductById').mockResolvedValue(mockCreatedProduct);
    });

    it('should successfully update everything including a new image and delete the old one', async () => {
      // 1. Configurar los mocks para el camino feliz completo
      mockProductsRepository.getProductByName.mockResolvedValue(null); // No hay conflicto de nombre
      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockCloudinaryService.uploadImage.mockResolvedValue(mockUploadedImage);
      mockCloudinaryService.deleteImage.mockResolvedValue({ result: 'ok' });
      mockProductsRepository.updateProduct.mockResolvedValue({ message: 'Product updated successfully' });

      // 2. Ejecutar pasando DTO completo y archivo
      const result = await productsService.updateProduct(mockCreatedProduct.id, updateDto, mockFile);

      // 3. Verificaciones
      expect(result).toEqual({ message: 'Product updated successfully' });
      expect(getProductByIdSpy).toHaveBeenCalledWith(mockCreatedProduct.id);
      expect(mockProductsRepository.getProductByName).toHaveBeenCalledWith(updateDto.name);
      expect(mockCategoriesService.getCategoryById).toHaveBeenCalledWith(updateDto.categoryId);
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(mockFile);
      
      // VERIFICACIÓN CLAVE: Se eliminó la imagen vieja usando el imgPublicId del producto existente
      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(mockUploadedImage.public_id);

      // Verificar que el repositorio recibe los datos mapeados correctos (incluyendo el nuevo slug)
      expect(mockProductsRepository.updateProduct).toHaveBeenCalledWith(
        mockCreatedProduct,
        updateDto.name,
        updateDto.description,
        updateDto.price,
        updateDto.stock,
        mockUploadedImage.secure_url,
        mockUploadedImage.public_id,
        'samsung-galaxy-s24', // Slug generado
        updateDto.isActive,
        mockCategory
      );
    });

    it('should successfully update without modifying name, category, or file', async () => {
      // DTO parcial: solo modificamos stock e isActive
      const partialDto: ProductsUpdateDto = { stock: 50, isActive: false };
      mockProductsRepository.updateProduct.mockResolvedValue({ message: 'Product updated successfully' });

      const result = await productsService.updateProduct(mockCreatedProduct.id, partialDto, undefined);

      expect(result).toEqual({ message: 'Product updated successfully' });
      
      // Aseguramos que los bloques condicionales no se ejecutaron
      expect(mockProductsRepository.getProductByName).not.toHaveBeenCalled();
      expect(mockCategoriesService.getCategoryById).not.toHaveBeenCalled();
      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();

      // El repositorio recibe undefined en los campos no enviados
      expect(mockProductsRepository.updateProduct).toHaveBeenCalledWith(
        mockCreatedProduct,
        undefined, undefined, undefined, 50,
        undefined, undefined, undefined, false,
        undefined
      );
    });

    it('should throw ConflictException if the new name is already taken by another product', async () => {
      // El repositorio devuelve un producto con un ID DIFERENTE al que estamos editando
      const conflictingProduct: Product = {
        id: '68aefac3-ace6-44b1-a827-24c5d52cae66',
        name: 'Samsung Galaxy S24',
        description: mockProductDto.description,
        price: mockProductDto.price,
        stock: mockProductDto.stock,
        imgUrl: mockUploadedImage.secure_url,
        imgPublicId: mockUploadedImage.public_id,
        slug: 'samsung-galaxy-s24',
        isActive: true,
        orderDetails: [] as OrderDetail[],
        category: mockCategory,
      };

      mockProductsRepository.getProductByName.mockResolvedValue(conflictingProduct);

      await expect(productsService.updateProduct(mockCreatedProduct.id, updateDto, undefined)).rejects.toThrow(new ConflictException('Product already exists'));

      // El flujo se detiene inmediatamente
      expect(mockCategoriesService.getCategoryById).not.toHaveBeenCalled();
      expect(mockProductsRepository.updateProduct).not.toHaveBeenCalled();
    });

    it('should NOT throw ConflictException if the product name matches its own current name', async () => {
      // getProductByName devuelve el mismo producto porque no cambió de nombre o buscó el suyo propio
      mockProductsRepository.getProductByName.mockResolvedValue(mockCreatedProduct); 
      mockCategoriesService.getCategoryById.mockResolvedValue(mockCategory);
      mockProductsRepository.updateProduct.mockResolvedValue({ message: 'Product updated successfully' });

      // Ejecutamos pasándole el mismo nombre que ya tiene
      const result = await productsService.updateProduct(mockCreatedProduct.id, { name: 'Samsung Galaxy S23' }, undefined);

      expect(result).toEqual({ message: 'Product updated successfully' });
    });
  });

  describe('deleteProduct', () => {
    
    let getProductByIdSpy: jest.SpyInstance;

    beforeEach(() => {
      // Creamos el espía para el método interno
      getProductByIdSpy = jest.spyOn(productsService, 'getProductById');
    });

    it('should successfully delete a product and its image from Cloudinary', async () => {
      // 1. Configurar los mocks
      getProductByIdSpy.mockResolvedValue(mockCreatedProduct);
      mockCloudinaryService.deleteImage.mockResolvedValue({ result: 'ok' });
      mockProductsRepository.deleteProduct.mockResolvedValue({ message: 'Product deleted successfully' });

      // 2. Ejecutar el método
      const result = await productsService.deleteProduct(mockCreatedProduct.id);

      // 3. Verificaciones
      expect(result).toEqual({ message: 'Product deleted successfully' });
      expect(getProductByIdSpy).toHaveBeenCalledWith(mockCreatedProduct.id);
      
      // VERIFICACIÓN CLAVE: Se llamó a Cloudinary con el id público correcto
      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(mockCreatedProduct.imgPublicId);
      expect(mockProductsRepository.deleteProduct).toHaveBeenCalledWith(mockCreatedProduct);
    });

    it('should successfully delete a product without calling Cloudinary if it has no image', async () => {
      getProductByIdSpy.mockResolvedValue({...mockCreatedProduct, imgPublicId: null, imgUrl: null});
      mockProductsRepository.deleteProduct.mockResolvedValue({ message: 'Product deleted successfully' });

      const result = await productsService.deleteProduct(mockCreatedProduct.id);

      expect(result).toEqual({ message: 'Product deleted successfully' });
      expect(getProductByIdSpy).toHaveBeenCalledWith(mockCreatedProduct.id);
      
      // VERIFICACIÓN CLAVE: Cloudinary NO debió ser llamado porque imgPublicId es null
      expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
      expect(mockProductsRepository.deleteProduct).toHaveBeenCalledWith({...mockCreatedProduct, imgPublicId: null, imgUrl: null});
    });

    it('should bubble up NotFoundException if the product does not exist', async () => {
      // Forzamos a que getProductById lance el error (simulando que no lo encuentra)
      const mockError = new NotFoundException('Product not found');
      getProductByIdSpy.mockRejectedValue(mockError);

      await expect(productsService.deleteProduct(mockCreatedProduct.id)).rejects.toThrow(mockError);

      // El flujo se corta, no se borra imagen ni se llama al repositorio de eliminación
      expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
      expect(mockProductsRepository.deleteProduct).not.toHaveBeenCalled();
    });
  });
});