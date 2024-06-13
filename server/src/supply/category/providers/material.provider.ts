import { Provider } from '@nestjs/common';
import { ICategoryService } from '../services/category-service.interface';
import { CategoryService } from '../services/category.service';

export const CategoryServiceProvider: Provider = {
    provide: ICategoryService,
    useClass: CategoryService,
};
