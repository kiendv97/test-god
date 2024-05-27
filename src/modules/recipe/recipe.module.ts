import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Ingredient, IngredientSchema } from './schemas/ingredient.schema';
import { Step, StepSchema } from './schemas/step.schema';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { RecipeIngredient, RecipeIngredientSchema } from './schemas/recipeIngredient.schema';
import { RecipeStep, RecipeStepSchema } from './schemas/recipeStep.schema';
import { RecipesController } from './controllers/recipe.controller';
import { RecipesService } from './services/recipe.service';

@Module({
  controllers: [RecipesController],

  imports: [
    MongooseModule.forFeature([
      { name: Ingredient.name, schema: IngredientSchema },
      { name: Step.name, schema: StepSchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: RecipeIngredient.name, schema: RecipeIngredientSchema },
      { name: RecipeStep.name, schema: RecipeStepSchema },
    ]), 
  ],
  providers: [RecipesService],
  // Add controllers and providers here
})
export class RecipeModule {}
