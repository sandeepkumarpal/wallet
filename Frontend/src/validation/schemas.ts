import * as yup from "yup";
import type { TFunction } from "i18next";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  todayValue,
} from "../types/finance";

export const createStrongPasswordSchema = (t: TFunction) =>
  yup
    .string()
    .required(t("validation.passwordRequired"))
    .min(8, t("validation.passwordMin"))
    .matches(/[A-Z]/, t("validation.passwordUpper"))
    .matches(/[a-z]/, t("validation.passwordLower"))
    .matches(/[0-9]/, t("validation.passwordNumber"))
    .matches(/[^A-Za-z0-9]/, t("validation.passwordSpecial"));

export const createLoginSchema = (t: TFunction) =>
  yup.object({
    email: yup
      .string()
      .trim()
      .required(t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    password: yup.string().required(t("validation.passwordRequired")),
  });

export type LoginFormValues = yup.InferType<
  ReturnType<typeof createLoginSchema>
>;

export const createSignUpSchema = (t: TFunction) =>
  yup.object({
    fullName: yup
      .string()
      .trim()
      .required(t("validation.fullNameRequired"))
      .min(2, t("validation.fullNameMin"))
      .matches(/^[a-zA-Z\s.'-]+$/, t("validation.fullNameLetters")),
    email: yup
      .string()
      .trim()
      .required(t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    password: createStrongPasswordSchema(t),
    confirm: yup
      .string()
      .required(t("validation.confirmRequired"))
      .oneOf([yup.ref("password")], t("validation.passwordsMatch")),
  });

export type SignUpFormValues = yup.InferType<
  ReturnType<typeof createSignUpSchema>
>;

export const createChangePasswordSchema = (t: TFunction) =>
  yup.object({
    currentPassword: yup
      .string()
      .required(t("validation.currentPasswordRequired")),
    newPassword: createStrongPasswordSchema(t),
  });

export type ChangePasswordFormValues = yup.InferType<
  ReturnType<typeof createChangePasswordSchema>
>;

const allCategories = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
] as string[];

export const createTransactionSchema = (t: TFunction) =>
  yup.object({
    expenseType: yup
      .mixed<"expense" | "income">()
      .oneOf(["expense", "income"])
      .required(t("validation.typeRequired")),
    amount: yup
      .string()
      .trim()
      .required(t("validation.amountRequired"))
      .test("is-number", t("validation.amountInvalid"), (value) => {
        if (value == null || value === "") return false;
        const n = Number(value);
        return !Number.isNaN(n);
      })
      .test("positive", t("validation.amountPositive"), (value) => {
        const n = Number(value);
        return n > 0;
      }),
    date: yup
      .string()
      .required(t("validation.dateRequired"))
      .matches(/^\d{4}-\d{2}-\d{2}$/, t("validation.dateInvalid"))
      .test("not-future", t("validation.dateNotFuture"), (value) => {
        if (!value) return false;
        return value <= todayValue();
      }),
    description: yup
      .string()
      .trim()
      .required(t("validation.descriptionRequired"))
      .min(2, t("validation.descriptionMin"))
      .max(120, t("validation.descriptionMax")),
    category: yup
      .string()
      .required(t("validation.categoryRequired"))
      .test("valid-category", t("validation.categoryInvalid"), function (value) {
        const type = this.parent.expenseType as "expense" | "income";
        const list =
          type === "income"
            ? (INCOME_CATEGORIES as readonly string[])
            : (EXPENSE_CATEGORIES as readonly string[]);
        if (!value) return false;
        return list.includes(value) || allCategories.includes(value);
      }),
    paymentMethod: yup
      .string()
      .trim()
      .required(t("validation.paymentRequired"))
      .min(1, t("validation.paymentRequired")),
    notes: yup
      .string()
      .trim()
      .max(250, t("validation.notesMax"))
      .default(""),
  });

export type TransactionFormValues = yup.InferType<
  ReturnType<typeof createTransactionSchema>
>;
