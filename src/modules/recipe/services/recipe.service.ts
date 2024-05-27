import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Recipe, RecipeDocument } from '../schemas/recipe.schema';
import { Ingredient, IngredientDocument } from '../schemas/ingredient.schema';
import { Step, StepDocument } from '../schemas/step.schema';
import { RecipeIngredient, RecipeIngredientDocument } from '../schemas/recipeIngredient.schema';
import { RecipeStep, RecipeStepDocument } from '../schemas/recipeStep.schema';
import { CreateIngredientDto, CreateRecipeDto, CreateStepDto, UpdateRecipeDto } from '../dtos/recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
    @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>,
    @InjectModel(Step.name) private stepModel: Model<StepDocument>,
    @InjectModel(RecipeIngredient.name) private recipeIngredientModel: Model<RecipeIngredientDocument>,
    @InjectModel(RecipeStep.name) private recipeStepModel: Model<RecipeStepDocument>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const { ingredients, steps, ...recipeData } = createRecipeDto;

    // Create ingredients
    const createdIngredients = await this.ingredientModel.create(ingredients);

    // Create steps
    const createdSteps = await this.stepModel.create(steps);

    // Create the recipe document
    const createdRecipe = await this.recipeModel.create({
      ...recipeData,
      ingredients: createdIngredients.map(ingredient => ingredient._id),
      steps: createdSteps.map(step => step._id),
    });

    // Create references in RecipeIngredient and RecipeStep
    const recipeIngredientPromises = createdIngredients.map(async ingredient => {
      return this.recipeIngredientModel.create({
        recipeId: createdRecipe._id,
        ingredientId: ingredient._id,
        quantity: (ingredient as any).quantity || '1', // Assuming there's a quantity field in IngredientDto
      });
    });

    const recipeStepPromises = createdSteps.map(async (step, index) => {
      return this.recipeStepModel.create({
        recipeId: createdRecipe._id,
        stepId: step._id,
        stepOrder: index + 1,
      });
    });

    await Promise.all([...recipeIngredientPromises, ...recipeStepPromises]);

    return createdRecipe;
  }


  async findAll(): Promise<Recipe[]> {
    return this.recipeModel.find().exec();
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
    const existingRecipe = await this.recipeModel.findByIdAndUpdate(id, updateRecipeDto, { new: true }).exec();
    if (!existingRecipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    return existingRecipe;
  }

  async remove(id: string): Promise<void> {
    const result = await this.recipeModel.findByIdAndRemove(id).exec();
    if (!result) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
  }

  async createIngredient(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    const createdIngredient = new this.ingredientModel(createIngredientDto);
    return createdIngredient.save();
  }

  async createStep(createStepDto: CreateStepDto): Promise<Step> {
    const createdStep = new this.stepModel(createStepDto);
    return createdStep.save();
  }
}
