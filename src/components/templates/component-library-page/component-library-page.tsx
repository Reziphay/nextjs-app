"use client";

import type { ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  Badge,
  Button,
  Checkbox,
  Combobox,
  ComboboxItem,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  Input,
  Switch,
} from "@/components/atoms";
import { LanguageSwitcher } from "@/components/molecules";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import styles from "./component-library-page.module.css";

const logoSizes = [40, 64, 96] as const;

const iconSamples = [
  { label: "Home", icon: "home", color: "primary" as const, fill: true },
  { label: "Search", icon: "search", color: "black" as const, fill: false },
  { label: "Done", icon: "check_circle", color: "success" as const, fill: true },
  { label: "Warning", icon: "warning", color: "warn" as const, fill: true },
  { label: "Delete", icon: "delete", color: "error" as const, fill: true },
  { label: "Favorite", icon: "favorite", color: "primary" as const, fill: false },
] as const;

const buttonSizes = ["small", "medium", "large"] as const;

const checkboxItems = [
  { label: "Hard disks", defaultChecked: true },
  { label: "External disks", defaultChecked: true },
  { label: "CDs, DVDs, and iPods", defaultChecked: false },
  { label: "Connected servers", defaultChecked: false },
] as const;

const frameworkOptions = [
  { value: "nextjs", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
] as const;

const countryOptions = [
  {
    value: "ar",
    label: "Argentina",
    description: "South America (ar)",
    keywords: ["south america", "argentina"],
  },
  {
    value: "au",
    label: "Australia",
    description: "Oceania (au)",
    keywords: ["oceania", "australia"],
  },
  {
    value: "br",
    label: "Brazil",
    description: "South America (br)",
    keywords: ["south america", "brazil"],
  },
  {
    value: "ca",
    label: "Canada",
    description: "North America (ca)",
    keywords: ["north america", "canada"],
  },
  {
    value: "cn",
    label: "China",
    description: "Asia (cn)",
    keywords: ["asia", "china"],
  },
] as const;

type ShowcaseCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function ShowcaseCard({ title, description, children }: ShowcaseCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <div className={styles.preview}>{children}</div>
    </article>
  );
}

export function ComponentLibraryPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.badge}>/lib</span>
          <h1>Component Library</h1>
          <p className={styles.lead}>
            Hazirki atom və əsas UI komponentləri bu səhifədə bir yerdə
            sərgilənir. Yeni komponentlər əlavə olunduqca bu route onların
            vizual yoxlanış nöqtəsi kimi istifadə oluna bilər.
          </p>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Brand</span>
            <h2>Logo</h2>
            <p>
              `Logo` komponenti klik zamanı həmişə ana səhifəyə yönləndirir və
              `size` prop-u ilə ölçü alır.
            </p>
          </div>

          <div className={styles.cardGrid}>
            {logoSizes.map((size) => (
              <ShowcaseCard
                key={size}
                title={`${size}px`}
                description="Ana səhifəyə kliklə dönən brend elementi"
              >
                <Logo size={size} priority={size === logoSizes[0]} />
              </ShowcaseCard>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atoms</span>
            <h2>Icon</h2>
            <p>
              Google Fonts Material Symbols Rounded üzərindən işləyən ikon
              komponenti. `icon`, `size`, `color` və `fill` prop-ları ilə idarə
              olunur.
            </p>
          </div>

          <div className={styles.iconGrid}>
            {iconSamples.map((sample) => (
              <article key={sample.label} className={styles.iconCard}>
                <div className={styles.iconPreview}>
                  <Icon
                    icon={sample.icon}
                    size={32}
                    color={sample.color}
                  />
                </div>
                <div className={styles.iconMeta}>
                  <strong>{sample.label}</strong>
                  <span>{sample.icon}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atoms</span>
            <h2>Alert Dialog</h2>
            <p>
              `AlertDialog` təsdiq tələb edən axınlar üçündür. Media elementi,
              destructive action və `size=&quot;sm&quot;` kimi variantları
              dəstəkləyir.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <ShowcaseCard
              title="Basic"
              description="Standart təsdiq dialoqu"
            >
              <div className={styles.buttonStack}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Show dialog</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </ShowcaseCard>

            <ShowcaseCard
              title="Destructive"
              description="Media və destructive action ilə istifadə"
            >
              <div className={styles.buttonStack}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete chat</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogMedia tone="destructive">
                      <Icon icon="delete" size={30} color="error" />
                    </AlertDialogMedia>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this chat conversation and
                        any local data tied to it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction destructive>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </ShowcaseCard>

            <ShowcaseCard
              title="Small"
              description="size=sm ilə daha yığcam görünüş"
            >
              <div className={styles.buttonStack}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button icon="share" variant="secondary">
                      Share project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogMedia>
                      <Icon icon="share" size={28} color="black" />
                    </AlertDialogMedia>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Share this project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Anyone with the link will be able to view this project.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Share</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </ShowcaseCard>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Molecules</span>
            <h2>Language Switcher</h2>
            <p>
              Locale switching üçün istifadə olunan yığcam və sadə variant.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <ShowcaseCard title="Compact" description="Header və popup üçün istifadə olunan yığcam variant">
              <LanguageSwitcher />
            </ShowcaseCard>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atoms</span>
            <h2>Button</h2>
            <p>
              Bütün variantlar eyni `Button` komponentində props-larla idarə
              olunur. Aşağıda həm variant, həm size, həm də loading nümunələri
              görünür.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <ShowcaseCard title="Variants" description="Əsas görünüş variantları">
              <div className={styles.buttonStack}>
                <Button variant="primary">Primary</Button>
                <Button>Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </ShowcaseCard>

            <ShowcaseCard title="Sizes" description="Eyni komponentin size variantları">
              <div className={styles.buttonStack}>
                {buttonSizes.map((size) => (
                  <Button key={size} size={size}>
                    {size}
                  </Button>
                ))}
              </div>
            </ShowcaseCard>

            <ShowcaseCard title="With Icon" description="Mətnlə birlikdə icon istifadəsi">
              <div className={styles.buttonStack}>
                <Button icon="account_tree">New Branch</Button>
                <Button variant="outline" icon="download">
                  Download
                </Button>
                <Button variant="secondary" icon="share">
                  Share
                </Button>
              </div>
            </ShowcaseCard>

            <ShowcaseCard title="Icon Only" description="Yalnız ikon göstərən variant">
              <div className={styles.buttonStack}>
                <Button variant="icon" icon="home" aria-label="Home" />
                <Button
                  variant="icon"
                  icon="favorite"
                  aria-label="Favorite"
                />
                <Button variant="icon" icon="settings" aria-label="Settings" />
              </div>
            </ShowcaseCard>

            <ShowcaseCard title="Loading" description="İşləmə halı və disabled davranışı">
              <div className={styles.buttonStack}>
                <Button isLoading>Saving</Button>
                <Button variant="outline" isLoading>
                  Processing
                </Button>
                <Button
                  variant="icon"
                  icon="autorenew"
                  isLoading
                  aria-label="Loading"
                />
              </div>
            </ShowcaseCard>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atoms</span>
            <h2>Input</h2>
            <p>
              Form primitive-ləri `Input`, `Field`, `FieldLabel` və
              `FieldDescription` üzərindən kompozisiya olunur. Basic, invalid,
              disabled, file və required halları aşağıda görünür.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <ShowcaseCard title="Basic" description="Sadə text input nümunəsi">
              <Input
                className={styles.basicInput}
                aria-label="Basic input example"
                placeholder="Enter text"
              />
            </ShowcaseCard>

            <ShowcaseCard
              title="Field"
              description="Label və description ilə birlikdə istifadə"
            >
              <Field className={styles.fieldShowcase}>
                <FieldLabel htmlFor="component-library-username">
                  Username
                </FieldLabel>
                <Input
                  id="component-library-username"
                  placeholder="Enter your username"
                />
                <FieldDescription>
                  Choose a unique username for your account.
                </FieldDescription>
              </Field>
            </ShowcaseCard>

            <ShowcaseCard
              title="Invalid"
              description="aria-invalid və data-invalid ilə validation halı"
            >
              <Field className={styles.fieldShowcase} data-invalid>
                <FieldLabel htmlFor="component-library-invalid">
                  Invalid Input
                </FieldLabel>
                <Input
                  id="component-library-invalid"
                  defaultValue="Error"
                  aria-invalid="true"
                />
                <FieldDescription>
                  This field contains validation errors.
                </FieldDescription>
              </Field>
            </ShowcaseCard>

            <ShowcaseCard
              title="Disabled"
              description="disabled input və data-disabled wrapper"
            >
              <Field className={styles.fieldShowcase} data-disabled>
                <FieldLabel htmlFor="component-library-disabled">
                  Email
                </FieldLabel>
                <Input
                  id="component-library-disabled"
                  placeholder="Email"
                  disabled
                />
                <FieldDescription>
                  This field is currently disabled.
                </FieldDescription>
              </Field>
            </ShowcaseCard>

            <ShowcaseCard
              title="File"
              description="type=file üzərindən fayl seçimi"
            >
              <Field className={styles.fieldShowcase}>
                <FieldLabel htmlFor="component-library-file">
                  Picture
                </FieldLabel>
                <Input id="component-library-file" type="file" />
                <FieldDescription>
                  Select a picture to upload.
                </FieldDescription>
              </Field>
            </ShowcaseCard>

            <ShowcaseCard
              title="Required"
              description="required input və label üzərində ulduz"
            >
              <Field className={styles.fieldShowcase}>
                <FieldLabel
                  htmlFor="component-library-required"
                  required
                >
                  Required Field
                </FieldLabel>
                <Input
                  id="component-library-required"
                  placeholder="This field is required"
                  required
                />
                <FieldDescription>
                  This field must be filled out.
                </FieldDescription>
              </Field>
            </ShowcaseCard>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atoms</span>
            <h2>Checkbox</h2>
            <p>
              `Checkbox` komponenti `Field`, `FieldLabel`, `FieldContent` və
              `FieldDescription` ilə birlikdə istifadə olunacaq şəkildə
              qurulub. Aşağıda basic, helper text, disabled və group nümunələri
              görünür.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <ShowcaseCard
              title="Basic"
              description="Sadə label ilə checkbox istifadəsi"
            >
              <Field className={styles.checkboxField}>
                <Checkbox id="component-library-checkbox-basic" />
                <FieldLabel
                  htmlFor="component-library-checkbox-basic"
                  className={styles.checkboxLabel}
                >
                  Accept terms and conditions
                </FieldLabel>
              </Field>
            </ShowcaseCard>

            <ShowcaseCard
              title="Description"
              description="FieldContent və FieldDescription ilə helper text"
            >
              <Field className={styles.checkboxField}>
                <Checkbox
                  id="component-library-checkbox-description"
                  defaultChecked
                />
                <FieldContent className={styles.checkboxContent}>
                  <FieldLabel
                    htmlFor="component-library-checkbox-description"
                    className={styles.checkboxLabel}
                  >
                    Accept terms and conditions
                  </FieldLabel>
                  <FieldDescription>
                    By clicking this checkbox, you agree to the terms and
                    conditions.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </ShowcaseCard>

            <ShowcaseCard
              title="Disabled"
              description="disabled prop və data-disabled wrapper istifadəsi"
            >
              <Field className={styles.checkboxField} data-disabled>
                <Checkbox
                  id="component-library-checkbox-disabled"
                  disabled
                />
                <FieldLabel
                  htmlFor="component-library-checkbox-disabled"
                  className={styles.checkboxLabel}
                >
                  Enable notifications
                </FieldLabel>
              </Field>
            </ShowcaseCard>

            <ShowcaseCard
              title="Group"
              description="Bir neçə checkbox ilə list quruluşu"
            >
              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxGroupHeader}>
                  <strong>Show these items on the desktop:</strong>
                  <p>Select the items you want to show on the desktop.</p>
                </div>

                <div className={styles.checkboxList}>
                  {checkboxItems.map((item) => {
                    const id = `component-library-checkbox-${item.label
                      .toLowerCase()
                      .replaceAll(/[^a-z0-9]+/g, "-")}`;

                    return (
                      <Field key={id} className={styles.checkboxField}>
                        <Checkbox id={id} defaultChecked={item.defaultChecked} />
                        <FieldLabel
                          htmlFor={id}
                          className={styles.checkboxLabel}
                        >
                          {item.label}
                        </FieldLabel>
                      </Field>
                    );
                  })}
                </div>
              </div>
            </ShowcaseCard>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atoms</span>
            <h2>Switch</h2>
            <p>
              `Switch` komponenti native checkbox əsasında qurulub və `size`
              prop-u ilə ölçü dəyişir. `Field` primitive-ləri ilə birlikdə
              label, description və disabled halları rahat kompozisiya olunur.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <ShowcaseCard
              title="Basic"
              description="Sadə switch və label istifadəsi"
            >
              <Field className={styles.switchField}>
                <Switch id="component-library-switch-basic" />
                <FieldLabel
                  htmlFor="component-library-switch-basic"
                  className={styles.switchLabel}
                >
                  Airplane Mode
                </FieldLabel>
              </Field>
            </ShowcaseCard>

            <ShowcaseCard
              title="Size"
              description="small və default ölçüləri"
            >
              <div className={styles.switchStack}>
                <Field className={styles.switchField}>
                  <Switch id="component-library-switch-small" size="small" />
                  <FieldLabel
                    htmlFor="component-library-switch-small"
                    className={styles.switchLabel}
                  >
                    Small
                  </FieldLabel>
                </Field>

                <Field className={styles.switchField}>
                  <Switch id="component-library-switch-default" />
                  <FieldLabel
                    htmlFor="component-library-switch-default"
                    className={styles.switchLabel}
                  >
                    Default
                  </FieldLabel>
                </Field>
              </div>
            </ShowcaseCard>

            <ShowcaseCard
              title="Disabled"
              description="disabled prop və data-disabled wrapper istifadəsi"
            >
              <Field className={styles.switchField} data-disabled>
                <Switch id="component-library-switch-disabled" disabled />
                <FieldLabel
                  htmlFor="component-library-switch-disabled"
                  className={styles.switchLabel}
                >
                  Disabled
                </FieldLabel>
              </Field>
            </ShowcaseCard>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atoms</span>
            <h2>Alert</h2>
            <p>
              `Alert`, `AlertTitle` və `AlertDescription` birlikdə işləyən
              kompozisiya olunan bir quruluşdur. Variant ilə fərqli semantik
              halları idarə etmək olur.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <ShowcaseCard
              title="Basic"
              description="Icon, title və description ilə standart alert"
            >
              <Alert
                className={styles.alertShowcase}
                icon="check_circle"
              >
                <AlertTitle>Account updated successfully</AlertTitle>
                <AlertDescription>
                  Your profile information has been saved. Changes will be
                  reflected immediately.
                </AlertDescription>
              </Alert>
            </ShowcaseCard>

            <ShowcaseCard
              title="Destructive"
              description="variant=destructive ilə xəta alert-i"
            >
              <Alert
                variant="destructive"
                className={styles.alertShowcase}
                icon="error"
              >
                <AlertTitle>Payment failed</AlertTitle>
                <AlertDescription>
                  Your payment could not be processed. Please check your
                  payment method and try again.
                </AlertDescription>
              </Alert>
            </ShowcaseCard>

            <ShowcaseCard
              title="Warning"
              description="variant=warning ilə xəbərdarlıq alert-i"
            >
              <Alert
                variant="warning"
                className={styles.alertShowcase}
                icon="warning"
              >
                <AlertTitle>Your subscription will expire in 3 days.</AlertTitle>
                <AlertDescription>
                  Renew now to avoid service interruption or upgrade to a paid
                  plan to continue using the service.
                </AlertDescription>
              </Alert>
            </ShowcaseCard>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atoms</span>
            <h2>Badge</h2>
            <p>
              `Badge` komponenti qısa status və kateqoriya göstəriciləri üçün
              nəzərdə tutulub. `variant`, `icon` və `iconPosition` ilə eyni
              komponent daxilində fərqli görünüşlər idarə olunur.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <ShowcaseCard
              title="Basic"
              description="Əsas variantların birlikdə görünüşü"
            >
              <div className={styles.badgeStack}>
                <Badge>Badge</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </ShowcaseCard>

            <ShowcaseCard
              title="With Icon"
              description="İkonu solda və ya sağda göstərmək olur"
            >
              <div className={styles.badgeStack}>
                <Badge variant="secondary" icon="verified">
                  Verified
                </Badge>
                <Badge
                  variant="outline"
                  icon="bookmark"
                  iconPosition="inline-end"
                >
                  Bookmark
                </Badge>
              </div>
            </ShowcaseCard>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atoms</span>
            <h2>Combobox</h2>
            <p>
              `Combobox` single və multiple seçim, search, chips, custom item
              render, invalid və disabled halları dəstəkləyir. `ComboboxItem`
              custom dropdown content, `ComboboxChips` isə multiple seçim
              görünüşü üçün daxildə istifadə olunur.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <ShowcaseCard
              title="Basic"
              description="Tək seçim və seçilmiş dəyərin göstərilməsi"
            >
              <Combobox
                className={styles.comboboxShowcase}
                items={frameworkOptions}
                defaultValue="sveltekit"
                placeholder="Select a framework"
                aria-label="Framework combobox basic example"
              />
            </ShowcaseCard>

            <ShowcaseCard
              title="Search"
              description="Yazdıqca nəticələri filter edən combobox"
            >
              <Combobox
                className={styles.comboboxShowcase}
                items={frameworkOptions}
                placeholder="Search frameworks..."
                aria-label="Framework combobox search example"
              />
            </ShowcaseCard>

            <ShowcaseCard
              title="Multiple"
              description="multiple seçim və chip görünüşü"
            >
              <Combobox
                className={styles.comboboxWide}
                items={frameworkOptions}
                defaultValue={["nextjs"]}
                placeholder="Select frameworks..."
                multiple
                aria-label="Framework combobox multiple example"
              />
            </ShowcaseCard>

            <ShowcaseCard
              title="Custom Items"
              description="Dropdown item-larını custom content ilə render etmək"
            >
              <Combobox
                className={styles.comboboxShowcase}
                items={countryOptions}
                placeholder="Search countries..."
                aria-label="Country combobox custom item example"
                renderItem={(item) => (
                  <ComboboxItem description={item.description}>
                    {item.label}
                  </ComboboxItem>
                )}
              />
            </ShowcaseCard>

            <ShowcaseCard
              title="Invalid"
              description="aria-invalid ilə xəta halı"
            >
              <Combobox
                className={styles.comboboxShowcase}
                items={frameworkOptions}
                placeholder="Select a framework"
                aria-label="Framework combobox invalid example"
                aria-invalid="true"
              />
            </ShowcaseCard>

            <ShowcaseCard
              title="Disabled"
              description="disabled prop ilə interaction-un bağlanması"
            >
              <Combobox
                className={styles.comboboxShowcase}
                items={frameworkOptions}
                placeholder="Select a framework"
                aria-label="Framework combobox disabled example"
                disabled
              />
            </ShowcaseCard>
          </div>
        </section>
      </div>
    </main>
  );
}
