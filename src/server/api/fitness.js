import ExerciseModel from './exercise-model';
import UserModel from './user-model';

const Fitness = {}

Fitness.addUser = UserModel.add
Fitness.addExercise = ExerciseModel.add
Fitness.getUserActivity = ExerciseModel.findByUserId

export default Fitness;