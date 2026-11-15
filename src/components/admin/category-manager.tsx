"use client";

import { useState, useTransition } from "react";

import { ConfirmAction } from "@/components/admin/confirm-action";
import { Field } from "@/components/admin/fields";
import { useFormAction } from "@/components/admin/use-form-action";
import { FormError, FormNotice } from "@/components/auth/form-status";
import {
  createCategory,
  deleteCategory,
  moveCategory,
  renameCategory,
} from "@/lib/admin/catalog-actions";

export type CategoryRow = { id: string; slug: string; name: string; products: number };

export function CategoryList({ categories }: { categories: CategoryRow[] }) {
  return (
    <ul className="flex flex-col">
      {categories.map((category, index) => (
        <CategoryItem
          key={category.id}
          category={category}
          first={index === 0}
          last={index === categories.length - 1}
        />
      ))}
    </ul>
  );
}

function CategoryItem({
  category,
  first,
  last,
}: {
  category: CategoryRow;
  first: boolean;
  last: boolean;
}) {
  const { state, errors, pending, onSubmit } = useFormAction(renameCategory);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [moving, startMove] = useTransition();

  const move = (direction: "up" | "down") => {
    setMoveError(null);
    startMove(async () => {
      const result = await moveCategory(category.id, direction);
      if (!result.ok) setMoveError(result.error);
    });
  };

  return (
    <li className="hairline flex flex-col gap-4 py-5 last:border-b last:border-line">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-body-sm">
        <span className="text-muted">/collections/{category.slug}</span>
        <span className="text-muted tabular-nums">
          {category.products} {category.products === 1 ? "product" : "products"}
        </span>
      </div>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3" noValidate>
        <input type="hidden" name="id" value={category.id} />
        <label className="flex min-w-48 flex-1 flex-col gap-1">
          <span className="sr-only">Name of {category.name}</span>
          <input
            name="name"
            required
            maxLength={80}
            defaultValue={category.name}
            aria-invalid={errors.name ? true : undefined}
            className="field text-body-lg"
          />
        </label>
        <button type="submit" className="btn btn-sm btn-secondary" disabled={pending}>
          {pending ? "Saving…" : "Rename"}
        </button>
      </form>
      <p
        role="status"
        className={`text-body-sm empty:hidden ${state.status === "saved" ? "text-success" : "text-danger"}`}
      >
        {state.status === "saved"
          ? state.message
          : state.status === "error"
            ? (errors.name ?? state.error)
            : null}
      </p>
      <div className="flex flex-wrap items-start gap-3">
        <button
          type="button"
          className="link-muted text-body-sm disabled:text-subtle"
          disabled={first || moving}
          onClick={() => move("up")}
        >
          Move up<span className="sr-only"> {category.name}</span>
        </button>
        <button
          type="button"
          className="link-muted text-body-sm disabled:text-subtle"
          disabled={last || moving}
          onClick={() => move("down")}
        >
          Move down<span className="sr-only"> {category.name}</span>
        </button>
        {category.products === 0 && (
          <ConfirmAction
            label={
              <>
                Delete<span className="sr-only"> {category.name}</span>
              </>
            }
            className="link-muted text-body-sm underline underline-offset-4"
            title={`Delete ${category.name}?`}
            description="The category has no products. Its /collections page will stop working, so remove any links to it first."
            confirmLabel="Delete"
            action={() => deleteCategory(category.id)}
          />
        )}
        {moveError && (
          <p role="status" className="text-body-sm text-danger">
            {moveError}
          </p>
        )}
      </div>
    </li>
  );
}

export function NewCategoryForm() {
  const { state, errors, pending, onSubmit, formRef } = useFormAction(createCategory, {
    resetOnSave: true,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <Field label="Name" name="name" required maxLength={80} error={errors.name} />
      <Field
        label="Slug"
        name="slug"
        required
        maxLength={100}
        error={errors.slug}
        hint="Used in the URL: /collections/your-slug. It can't be changed later."
      />
      {state.status === "error" && !state.fieldErrors && <FormError>{state.error}</FormError>}
      {state.status === "saved" && <FormNotice>{state.message}</FormNotice>}
      <button type="submit" className="btn btn-secondary self-start" disabled={pending}>
        {pending ? "Adding…" : "Add category"}
      </button>
    </form>
  );
}
