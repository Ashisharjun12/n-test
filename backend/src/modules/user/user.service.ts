import { ApiError } from "../../shared/errors/apiError.js";
import { hashPassword } from "../../utils/token.js";
import {
  CreateUserDto,
  IUserRepository,
  IUserService,
  UpdateRoleDto,
  UpdateUserDto,
} from "./user.interface.js";
import { IUser } from "./user.schema.js";
import { ICompanyRepository } from "../company/company.interface.js";

export class UserService implements IUserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly companyRepo: ICompanyRepository
  ) {}

  async create(data: CreateUserDto): Promise<IUser> {
    // Check duplicate email
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw ApiError.conflict("User with this email already exists.");

    // Hash password & create user
    data.password = await hashPassword(data.password);
    const user = await this.userRepo.create(data);

    // Auto-create a default company for the new user
    await this.companyRepo.create({
      userId: user._id.toString(),
      name: `${user.name}'s Business`,
    });

    return user;
  }

  async findAll(): Promise<IUser[]> {
    return this.userRepo.findAll();
  }

  async findById(id: string): Promise<IUser | null> {
    return this.userRepo.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.userRepo.findByEmail(email);
  }

  async update(id: string, data: UpdateUserDto): Promise<IUser | null> {
    const user = await this.userRepo.findById(id);
    if (!user) throw ApiError.notFound("User not found.");
    return this.userRepo.update(id, data);
  }

  async updateRole(id: string, data: UpdateRoleDto): Promise<IUser | null> {
    const user = await this.userRepo.findById(id);
    if (!user) throw ApiError.notFound("User not found.");
    return this.userRepo.updateRole(id, data);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw ApiError.notFound("User not found.");
    return this.userRepo.delete(id);
  }
}
