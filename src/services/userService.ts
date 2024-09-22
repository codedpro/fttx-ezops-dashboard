import Cookies from "js-cookie";

interface User {
  email: string;
  name: string;
  role: string[];
  UserName: string;
  Profile: string;
  Phone: string;
}

export class UserService {
  private token: string | null = null;
  private email: string | null = null;
  private name: string | null = null;
  private role: string[] | null = null;
  private userName: string | null = null;
  private profile: string | null = null;
  private phone: string | null = null;
  constructor() {
    this.token = this.getTokenFromCookie();
    this.email = this.getEmailFromCookie();
    this.name = this.getNameFromCookie();
    this.role = this.getRoleFromCookie();
    this.userName = this.getUserNameFromCookie();
    this.profile = this.getProfileFromCookie();
    this.phone = this.getPhoneFromCookie();
  }

  private getTokenFromCookie(): string | null {
    const token = Cookies.get("AccessToken");
    if (token) {
      return token;
    } else {
      console.error("AccessToken not found in cookies");
      return null;
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private getEmailFromCookie(): string | null {
    const email = Cookies.get("Email");
    if (email) {
      return email;
    }
    return null;
  }

  public getEmail(): string | null {
    return this.email;
  }

  private getNameFromCookie(): string | null {
    const name = Cookies.get("Name");
    if (name) {
      return name;
    }
    return null;
  }

  public getName(): string | null {
    return this.name;
  }

  private getRoleFromCookie(): string[] | null {
    const roleCookie = Cookies.get("Role");
    if (roleCookie) {
      try {
        return JSON.parse(roleCookie) as string[];
      } catch (error) {
        console.error("Error parsing role cookie:", error);
        return null;
      }
    }
    return null;
  }

  public getRole(): string[] | null {
    return this.role;
  }

  private getUserNameFromCookie(): string | null {
    const userName = Cookies.get("UserName");
    if (userName) {
      return userName;
    }
    return null;
  }

  public getUserName(): string | null {
    return this.userName;
  }

  private getProfileFromCookie(): string | null {
    const profile = Cookies.get("Profile");
    if (profile) {
      return profile;
    }
    return null;
  }
  public getProfile(): string | null {
    return this.profile;
  }

  private getPhoneFromCookie(): string | null {
    const phone = Cookies.get("Phone");
    if (phone) {
      return phone;
    }
    return null;
  }
  public getPhone(): string | null {
    return this.phone;
  }

  public logout(): void {
    Cookies.remove("AccessToken");
    Cookies.remove("Email");
    Cookies.remove("Name");
    Cookies.remove("Role");
    Cookies.remove("UserName");
    Cookies.remove("Profile");
    Cookies.remove("Phone");
    this.token = null;
    this.email = null;
    this.name = null;
    this.role = null;
    this.userName = null;
    this.profile = null;
    this.phone = null;
  }

  public setUserInfo(user: User, token: string): void {
    Cookies.set("Email", user.email);
    Cookies.set("Name", user.name);
    Cookies.set("Role", JSON.stringify(user.role));
    Cookies.set("UserName", user.UserName);
    Cookies.set("Profile", user.Profile);
    Cookies.set("AccessToken", token);
    Cookies.set("Phone", user.Phone);
  }
}
