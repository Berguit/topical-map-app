import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Topical Map</h1>
          <nav>
            <Link href="/projects">
              <Button>Mes Projets</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Créez des <span className="text-primary">Topical Maps</span>
            <br />basées sur le Semantic SEO
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Construisez votre autorité topique avec une approche scientifique.
            Générez des réseaux de contenu sémantique et déployez-les sur WordPress.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/projects/new">
              <Button size="lg">Créer un projet</Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline">Voir mes projets</Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <h3 className="mb-12 text-center text-2xl font-bold">Workflow en 7 phases</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Onboarding</CardTitle>
                <CardDescription>Type business, audience, thématique</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Knowledge Domain</CardTitle>
                <CardDescription>Contexte source et paramètres qualité</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Context Vector</CardTitle>
                <CardDescription>Vocabulaire, prédicats, patterns 5W+H</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. Modèle EAV</CardTitle>
                <CardDescription>Entités, attributs clés, relations</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">5. Topical Map</CardTitle>
                <CardDescription>Hiérarchie, intents, expansion</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">6. Content Network</CardTitle>
                <CardDescription>Pillar, clusters, briefs, maillage</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">7. Déploiement</CardTitle>
                <CardDescription>WordPress automatisé</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">8. Monitoring</CardTitle>
                <CardDescription>Suivi et expansion continue</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Key concepts */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h3 className="mb-12 text-center text-2xl font-bold">Basé sur le Semantic SEO</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Topical Authority</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Construisez une autorité durable sur vos sujets en couvrant
                    tous les angles avec des contenus interconnectés.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Entity-Attribute-Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Structurez vos contenus autour des entités et de leurs attributs
                    clés pour une compréhension sémantique optimale.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Semantic Content Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Créez des réseaux de contenu avec des pillars et clusters
                    liés par un maillage interne stratégique.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Topical Map SaaS - Basé sur les recherches de Koray Tuğberk Gübür</p>
        </div>
      </footer>
    </div>
  );
}
