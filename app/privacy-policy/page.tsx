import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Privacy"
        title="Privacy Policy"
        description="How Tunes by Bok handles user and usage data for this web-based open-source music player."
      />
      <Card>
        <CardContent className="grid gap-5 p-5 text-sm leading-6 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">About this project</h2>
            <p>Tunes by Bok is a web-based open-source music player made for educational, development, and testing purposes. It is not intended for commercial use, resale, paid streaming, or public music distribution.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Information we store</h2>
            <p>The app may store the username you provide, browser user agent, session details, playlist records, download history, and music library metadata. This helps identify clients, monitor active sessions, and show who requested downloads.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">yt-dlp usage</h2>
            <p>Tunes by Bok can use yt-dlp to search for or process media. Users are responsible for making sure their use follows applicable laws, platform terms, copyright rules, and permissions for the content they access.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Browser storage</h2>
            <p>The app saves session tokens and preferences in browser local storage so users can stay signed in on the same device. Clearing browser storage may remove the local session.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Sharing and visibility</h2>
            <p>Shared playlists may be visible to other users of the app. Private playlists are intended to stay visible only to the user who created them. Administrators may view client activity for testing, debugging, and maintenance.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Contact</h2>
            <p>For questions about stored data, contact the app owner or administrator.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
