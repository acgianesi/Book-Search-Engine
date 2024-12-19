import User from '../models/User.js';
import { signToken, AuthenticationError } from '../services/auth.js';


interface LoginUserArgs {
  email: string;
  password: string;
}

interface AddUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
  }
}

interface SaveBookArgs {
  input: {
    bookId: string;
    authors: string;
    description: string;
    title: string;
    image: string;
    link: string;
  };
}

interface DeleteBookArgs {
  bookId: string;
}

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw new AuthenticationError('Cannot find a user with this id!');
    },
  },
  Mutation: {
    addUser: async (_parent: any, { input }: AddUserArgs) => {
      console.log("Hello")
      console.log(input)
      const user = await User.create({ ...input });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    login: async (_parent: any, { email, password }: LoginUserArgs) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Cannot find this user.');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Wrong password.');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    saveBook: async (_parent: any, { input }: SaveBookArgs, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to save a book.');
      }
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input.bookId } },
          { new: true, runValidators: true }
        );
        if (!updatedUser) {
          throw new Error('Unable to save the book to the user’s saved list.');
        }
        return updatedUser;
      } catch (error) {
        throw new Error(`Unexpected error`);
      }
    },

    removeBook: async (_parent: any, { bookId }: DeleteBookArgs, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a book.');
      }
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          throw new Error('Unable to delete the book from the user’s saved list.');
        }
        return updatedUser;
      } catch (error) {
        throw new Error(`Unexpected error`);
      }
    },
  },
};

export default resolvers;
