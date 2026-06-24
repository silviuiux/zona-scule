import { getAllCategories, getAllSubcategoriesWithCount } from "@/lib/data/categories";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = { title: "Admin" };

// No revalidate/ISR here on purpose — this is an authenticated internal
// tool, always rendered fresh per request (low traffic, correctness over
// caching). Unlike the public catalog pages, staleness here would show an
// admin an out-of-date category tree while they're actively editing it.
export default async function AdminPage() {
  const [categories, subcategories] = await Promise.all([
    getAllCategories(),
    getAllSubcategoriesWithCount(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display mb-2 text-3xl text-ink">Recategorizare subcategorii</h1>
      <p className="mb-8 text-sm text-text-muted">
        Reasignează o subcategorie (și toate produsele ei) la o altă categorie, redenumește-o,
        sau selectează mai multe pentru o reasignare în bloc.
      </p>
      <AdminDashboard categories={categories} subcategories={subcategories} />
    </div>
  );
}
