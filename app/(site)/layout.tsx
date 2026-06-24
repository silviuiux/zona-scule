import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * Public-site chrome (Nav + Footer). Lives in a route group so `/admin`
 * (sibling top-level segment, outside this group) gets its own minimal
 * layout instead of the marketing nav/footer.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
