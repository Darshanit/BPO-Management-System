import Card from '../components/ui/Card';

/** Generic "coming soon" placeholder so navigation links don't 404 while later phases are built. */
export default function PlaceholderPage({ title }) {
  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">{title}</h1>
      <Card className="text-center py-16">
        <p className="font-display font-bold text-lg">🚧 {title} module coming in the next phase</p>
        <p className="text-black/60 mt-2">The backend API for this section is already live.</p>
      </Card>
    </div>
  );
}
