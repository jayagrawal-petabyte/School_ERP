import { AuthService } from './profileApi';

const authApi = {
  login: async (
    identifier: string,
    password: string,
    role: string
  ) => {
    const result = await AuthService.login(identifier, password);

    if (
      result.success &&
      result.role &&
      result.role !== role
    ) {
      return {
        success: false,
        message: `This account belongs to ${result.role}`,
      };
    }

    return result;
  },
};

export default authApi;