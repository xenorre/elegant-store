"use client";

import { Field, Select, TextArea } from "@/components/admin/fields";
import { useFormAction } from "@/components/admin/use-form-action";
import { FormError, FormNotice } from "@/components/auth/form-status";
import { saveProduct } from "@/lib/admin/catalog-actions";
import { departmentOptions, formatGallery } from "@/lib/admin/validation";
import type { Department, ProductImage, ProductStatus } from "@/lib/catalog";

export type ProductFormValues = {
  id: string;
  slug: string;
  status: ProductStatus;
  name: string;
  categoryId: string;
  department: Department;
  priceCents: number;
  detail: string;
  description: string;
  details: string[];
  image: string;
  imageAlt: string;
  gallery: ProductImage[];
  badge: string | null;
};

type ProductFormProps = {
  categories: { id: string; name: string }[];
  /** Omitted when creating a product. */
  product?: ProductFormValues;
};

export function ProductForm({ categories, product }: ProductFormProps) {
  const { state, errors, pending, onSubmit } = useFormAction(saveProduct);
  const slugLocked = product && product.status !== "draft";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-8 sm:grid-cols-2">
        <Field
          label="Name"
          name="name"
          required
          maxLength={200}
          defaultValue={product?.name}
          error={errors.name}
        />
        <Field
          label="Slug"
          name="slug"
          required
          maxLength={100}
          defaultValue={product?.slug}
          readOnly={slugLocked}
          error={errors.slug}
          hint={
            slugLocked
              ? "The URL can't change once a product has been published."
              : "Used in the URL: /products/your-slug."
          }
        />
        <Select
          label="Category"
          name="categoryId"
          required
          defaultValue={product?.categoryId ?? ""}
          error={errors.categoryId}
        >
          <option value="" disabled>
            Choose a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          label="Department"
          name="department"
          defaultValue={product?.department ?? "unisex"}
          error={errors.department}
          hint="Unisex pieces appear in both departments."
        >
          {departmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Field
          label="Price (EUR)"
          name="price"
          inputMode="decimal"
          required
          defaultValue={product ? formatEuros(product.priceCents) : undefined}
          error={errors.price}
        />
        <Field
          label="Badge"
          name="badge"
          maxLength={40}
          defaultValue={product?.badge ?? ""}
          hint="Optional, such as “New” or “Limited”."
        />
      </div>

      <Field
        label="Short detail"
        name="detail"
        required
        maxLength={200}
        defaultValue={product?.detail}
        error={errors.detail}
        hint="Shown under the name on product cards, such as the material."
      />
      <TextArea
        label="Description"
        name="description"
        required
        rows={5}
        defaultValue={product?.description}
        error={errors.description}
      />
      <TextArea
        label="Details"
        name="details"
        rows={4}
        defaultValue={product?.details.join("\n")}
        hint="One per line."
      />

      <div className="grid gap-8 sm:grid-cols-2">
        <Field
          label="Main image URL"
          name="image"
          type="url"
          required
          defaultValue={product?.image}
          error={errors.image}
        />
        <Field
          label="Main image alt text"
          name="imageAlt"
          required
          maxLength={300}
          defaultValue={product?.imageAlt}
          error={errors.imageAlt}
        />
      </div>
      <TextArea
        label="Gallery"
        name="gallery"
        rows={4}
        defaultValue={product ? formatGallery(product.gallery) : ""}
        error={errors.gallery}
        hint="Extra images after the main one, one per line as “URL | alt text”. Only images.unsplash.com photos are supported for now."
      />

      {!product && (
        <Field
          label="Sizes"
          name="sizes"
          error={errors.sizes}
          placeholder="XS, S, M, L"
          hint="Comma-separated, in display order. Leave empty for a one-size piece. Stock starts at 0; add it after saving."
        />
      )}

      {state.status === "error" && <FormError>{state.error}</FormError>}
      {state.status === "saved" && <FormNotice>{state.message}</FormNotice>}

      <button type="submit" className="btn btn-primary self-start" disabled={pending}>
        {pending ? "Saving…" : product ? "Save changes" : "Create draft"}
      </button>
    </form>
  );
}

function formatEuros(cents: number) {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}
