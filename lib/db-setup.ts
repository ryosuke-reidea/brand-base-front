import { supabase } from './supabase';
import { creators as creatorsData, products as productsData } from './data';

export async function seedDatabase() {
  try {
    const { data: existingCreators } = await supabase
      .from('creators')
      .select('slug')
      .limit(1);

    if (existingCreators && existingCreators.length > 0) {
      console.log('Database already seeded');
      return;
    }

    const { error: creatorsError } = await supabase
      .from('creators')
      .insert(creatorsData);

    if (creatorsError) {
      console.error('Error inserting creators:', creatorsError);
      throw creatorsError;
    }

    const { error: productsError } = await supabase
      .from('products')
      .insert(productsData);

    if (productsError) {
      console.error('Error inserting products:', productsError);
      throw productsError;
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
