import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Terms"
        title="Terms and Conditions"
        description="Basic rules for using Tunes by Bok for open-source, educational, and testing purposes."
      />
      <Card>
        <CardContent className="grid gap-5 p-5 text-sm leading-6 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Purpose</h2>
            <p>Tunes by Bok is a web-based open-source music player provided for educational, testing, and development purposes. It is not offered as a commercial music service, paid streaming service, or content distribution platform.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Responsible use</h2>
            <p>You agree to use the app only with content you have the right to access, download, store, or play. You are responsible for complying with applicable laws, copyright rules, and third-party platform terms.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">yt-dlp</h2>
            <p>The app may integrate with yt-dlp. yt-dlp is a separate open-source tool. Tunes by Bok does not grant rights to third-party media and does not encourage bypassing restrictions, infringement, redistribution, or unauthorized commercial use.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Non-commercial use</h2>
            <p>This project is intended for non-commercial educational and testing use. Do not sell access to the app, use it as a paid music service, or use downloaded media for commercial redistribution.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Accounts and activity</h2>
            <p>You agree to provide a recognizable username when using the app. Downloads may be attributed to the user who requested them. Administrators may monitor active clients and user activity for maintenance, testing, security, and debugging.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Playlists</h2>
            <p>Shared playlists can be viewed by other users of the app. Do not use playlist sharing to publish, promote, or distribute content you do not have permission to use.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Availability</h2>
            <p>The app is provided as-is. Features may change, break, or be unavailable depending on local tools, network access, and server configuration.</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Changes</h2>
            <p>These terms may be updated as the app changes. Continued use of the app means you accept the latest version.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
