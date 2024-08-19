import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
}

export class UserService {
  private userInfo: User | null = null;
  private token: string | null = null;

  constructor() {
    this.userInfo = this.getUserFromCookie();
    this.token = this.getTokenFromCookie();
  }

  private getUserFromCookie(): User | null {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        return JSON.parse(userCookie) as User;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  private getTokenFromCookie(): string | null {
    const token = Cookies.get("token");
    if (token) {
      return token;
    } else {
      console.error("Token not found in cookies");
      return null;
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUserInfo(): User | null {
    return this.userInfo;
  }

  public getName(): string | null {
    return this.userInfo ? this.userInfo.name : null;
  }

  public getId(): string | null {
    return this.userInfo ? this.userInfo.id : null;
  }

  public logout(): void {
    Cookies.remove("user");
    Cookies.remove("token");
    this.userInfo = null;
    this.token = null;
  }
}
