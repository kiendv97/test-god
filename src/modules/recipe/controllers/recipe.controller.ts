import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { RecipesService } from '../services/recipe.service';
import { CreateIngredientDto, CreateRecipeDto, CreateStepDto, UpdateRecipeDto } from '../dtos/recipe.dto';



@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  async create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  async findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.recipesService.remove(id);
  }

  @Post('ingredient')
  async createIngredient(@Body() createIngredientDto: CreateIngredientDto) {
    return this.recipesService.createIngredient(createIngredientDto);
  }

  @Post('step')
  async createStep(@Body() createStepDto: CreateStepDto) {
    return this.recipesService.createStep(createStepDto);
  }
}
