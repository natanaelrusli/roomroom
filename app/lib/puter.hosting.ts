import puter from "@heyputer/puter.js";
import {
  HOSTING_CONFIG_KEY,
  createHostingSlug,
  fetchBlobFromUrl,
  getHostedUrl,
  getImageExtension,
  imageUrlToPngBlob,
  isHostedUrl,
} from "./utils";

type HostingConfig = {
  subdomain: string;
};

type HostedAsset = {
  url: string;
};

export const getOrCreateHostingConfig =
  async (): Promise<HostingConfig | null> => {
    const existing = (await puter.kv.get(
      HOSTING_CONFIG_KEY,
    )) as HostingConfig | null;

    if (existing?.subdomain) return { subdomain: existing.subdomain };

    const subdomain = createHostingSlug();

    try {
      const created = await puter.hosting.create(subdomain, ".");

      const record = { subdomain: created.subdomain };
      await puter.kv.set(HOSTING_CONFIG_KEY, record)
      return record;
    } catch (error) {
      console.warn("could not find subdomain");
      return null;
    }
  };

export const uploadImageToHosting = async ({
  hosting,
  url,
  projectId,
  label,
}: StoreHostedImageParams): Promise<HostedAsset | null> => {
  if (!hosting || !url) return null;

  if (isHostedUrl(url)) return { url };

  try {
    const resolved =
      label === "rendered"
        ? await imageUrlToPngBlob(url).then((blob) =>
          blob ? { blob, contentType: "image/png" } : null,
        )
        : await fetchBlobFromUrl(url);

    if (!resolved) return null;

    const contentType = resolved.contentType || resolved.blob.type || "";

    const ext = getImageExtension(contentType, url);

    // Sanitize projectId: allow only alphanumeric, dash, and underscore
    const safeProjectId = projectId.replace(/[^a-zA-Z0-9-_]/g, "");
    if (!safeProjectId) {
      console.warn("Invalid projectId after sanitization");
      return null;
    }

    const dir = `projects/${safeProjectId}`;
    const filePath = `${dir}/${label}.${ext}`;

    const uploadFile = new File([resolved.blob], `${label}.${ext}`, {
      type: contentType,
    });

    await puter.fs.mkdir(dir, { createMissingParents: true });
    await puter.fs.write(filePath, uploadFile);

    const hostedUrl = getHostedUrl({ subdomain: hosting.subdomain }, filePath);

    return hostedUrl ? { url: hostedUrl } : null;
  } catch (error) {
    console.warn(`Could not found hosting url ${error}`);
    return null;
  }
};
