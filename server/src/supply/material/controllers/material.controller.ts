import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { IMaterialService } from '../services/material-service.interface';
import { CreateMaterialResponseDto } from '../dtos/response/create-material-response.dto';
import { Roles } from '@/shared/decorators/role.decorator';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { RolesGuard } from '@/shared/guards/role.guard';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CreateMaterialDto } from '../dtos/request/create-material.dto';
import { MaterialListResponseDto } from '../dtos/response/material-list-response.dto';
import { GetMaterialListByCategoryDto } from '../dtos/request/get-material-list-by-category.dto';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';
import { UpdateMaterialDto } from '../dtos/request/update-material.dto';
import { MaterialDetailResponseDto } from '../dtos/response/material-detail-response.dto';

@Controller('materials')
export class MaterialController {
    constructor(@Inject(IMaterialService) private readonly materialService: IMaterialService) {}

    // [DELETE] /materials/:id
    @Roles('admin', 'manager')
    @UseGuards(RolesGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delte Material.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async deleteMaterial(@Param('id') id: string): Promise<BooleanResponseDto> {
        const result = await this.materialService.deleteMaterial(id);

        return new BooleanResponseDto(result);
    }

    // [PUT] /materials/:id
    @Roles('admin', 'manager')
    @UseGuards(RolesGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Update Material.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async updateMaterial(
        @Param('id') id: string,
        @Body() updateMaterialDto: UpdateMaterialDto,
    ): Promise<BooleanResponseDto> {
        updateMaterialDto.id = id;
        const result = await this.materialService.updateMaterial(updateMaterialDto);

        return new BooleanResponseDto(result);
    }

    // [GET] /materials/:id
    @Get(':id')
    @ApiOperation({ summary: 'Get Material Detail By Id.' })
    @ApiOkResponse({ type: MaterialDetailResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getMaterialDetail(@Param('id') id: string): Promise<MaterialDetailResponseDto> {
        const result = await this.materialService.getMaterialDetail(id);

        return new MaterialDetailResponseDto(result);
    }

    // [GET] /materials?categoryId=
    @Get()
    @ApiOperation({ summary: 'Get Material List.' })
    @ApiOkResponse({ type: MaterialListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getMaterialList(@Query() filters: GetMaterialListByCategoryDto): Promise<MaterialListResponseDto> {
        const result = await this.materialService.getMaterialList(filters);

        return new MaterialListResponseDto(result);
    }

    // [POST] /materials
    @Roles('admin', 'manager')
    @UseGuards(RolesGuard)
    @Post()
    @ApiOperation({ summary: 'Create Material.' })
    @ApiOkResponse({ type: CreateMaterialResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.CREATED)
    async createMaterial(@Body() createMaterialDto: CreateMaterialDto): Promise<CreateMaterialResponseDto> {
        const result = await this.materialService.createMaterial(createMaterialDto);

        return new CreateMaterialResponseDto(result);
    }
}
