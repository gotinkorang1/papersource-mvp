type ProductAttribute = {
  namespace: string;
  key: string;
  valueText: string;
};

type BookMetadataInput = {
  name: string;
  specLine: string;
  attributes: ProductAttribute[];
};

function normalized(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function bookMetadata({
  name,
  specLine,
  attributes,
}: BookMetadataInput): string[] {
  const bookAttributes = attributes.filter(
    (attribute) => attribute.namespace === "book",
  );
  const author = bookAttributes.find(
    (attribute) => attribute.key === "author",
  )?.valueText.trim();

  if (!author) return [];

  const format = bookAttributes.find(
    (attribute) => attribute.key === "format",
  )?.valueText.trim();
  const renderedIdentity = new Set(
    [name, specLine, ...specLine.split("•")]
      .map(normalized)
      .filter(Boolean),
  );

  return [`By ${author}`, format]
    .filter((value): value is string => Boolean(value))
    .filter((value) => !renderedIdentity.has(normalized(value)) && !renderedIdentity.has(normalized(value.replace(/^By\s+/i, ""))));
}
