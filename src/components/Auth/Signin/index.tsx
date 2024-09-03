"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";
import qs from "qs";
import { Input } from "@/components/FormElements/InputDark";
import {
  LabelInputContainer,
  BottomGradient,
} from "@/components/FormElements/InputUtils";
import { Label } from "@/components/FormElements/Label";
import { gsap } from "gsap";

export default function Signin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    password: false,
  });
  const router = useRouter();
  const separatorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (separatorRef.current) {
      gsap.fromTo(
        separatorRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
      );
    }

    if (formRef.current) {
      const fields = formRef.current.querySelectorAll(".form-field");
      gsap.fromTo(
        fields,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "back.out(1.7)",
          stagger: 0.3,
          delay: 0.5,
        }
      );
    }

    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
          delay: 1.2,
        }
      );
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    setFieldErrors({ ...fieldErrors, [name]: false });

    if (form.username && form.password) {
      setError("");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setFieldErrors({
        username: !form.username,
        password: !form.password,
      });
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    const data = qs.stringify({
      Username: form.username,
      Password: form.password,
    });

    const config = {
      method: "post",
      url: process.env.NEXT_PUBLIC_LNM_API_URL + "/login",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    try {
      const response = await axios(config);
      const data = response.data;

      if (response.status === 200) {
        Cookies.set("AccessToken", data.AcessToken, { expires: 1 });
        Cookies.set("Name", data.Name, { expires: 1 });
        Cookies.set("Email", data.Email, { expires: 1 });
        Cookies.set("Role", JSON.stringify(data.Role), { expires: 1 });
        Cookies.set("UserName", data.Username, { expires: 1 });
        router.push("/");
      } else {
        console.error("Failed to login:", data.message);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 401) {
          setError("Your account is suspended or your password is incorrect.");
        } else {
          console.error("An error occurred during login:", error.message);
        }
      } else {
        console.error("An unexpected error occurred:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div ref={separatorRef} className="my-4 flex items-center justify-center">
        <span className="block h-px w-full bg-dark-8"></span>
        <div className="block w-full min-w-fit  px-2 text-center font-medium text-dark-8 ">
          Sign in using Username
        </div>
        <span className="block h-px w-full bg-dark-7"></span>
      </div>

      <div ref={formRef}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-field">
            <LabelInputContainer>
              <Label htmlFor="UserName" className="block text-dark-8">
                UserName
              </Label>
              <Input
                type="text"
                name="username"
                placeholder="Amir"
                value={form.username}
                onChange={handleChange}
                error={fieldErrors.username}
                className="w-full"
              />
            </LabelInputContainer>
            {fieldErrors.username && (
              <div className="text-red-500 text-sm">Username is required.</div>
            )}
          </div>
          <div className="form-field">
            <LabelInputContainer>
              <Label htmlFor="Password" className="block text-dark-8">
                Password
              </Label>
              <Input
                type="password"
                name="password"
                placeholder="•••••••••••"
                value={form.password}
                onChange={handleChange}
                error={fieldErrors.password}
                className="w-full"
              />
            </LabelInputContainer>
            {fieldErrors.password && (
              <div className="text-red-500 text-sm">Password is required.</div>
            )}
          </div>
          <button
            ref={buttonRef}
            className={`bg-gradient-to-br relative group/btn from-dark-5 to-dark-6 block w-full text-white rounded-md h-10 font-medium border border-solid border-zinc-800 shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] ${loading ? "cursor-not-allowed opacity-70" : ""}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign in →"}
            <BottomGradient />
          </button>
        </form>
        {error && <div className="mt-4 text-center text-red-500">{error}</div>}
      </div>
    </>
  );
}
