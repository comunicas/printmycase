import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

interface Faq {
  id: string;
  question: string;
  answer: string;
}

const FaqSection = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);

  useEffect(() => {
    supabase
      .from("faqs")
      .select("id, question, answer")
      .eq("active", true)
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (data) setFaqs(data);
      });
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-16 px-5 bg-background">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
            Perguntas Frequentes
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <Accordion.Item
                key={faq.id}
                value={faq.id}
                className="rounded-xl border bg-card overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-5 text-left text-base font-medium text-foreground hover:bg-muted/50 transition-colors data-[state=open]:bg-muted/50 group">
                    {faq.question}
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="px-5 pt-1 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="text-center mt-8">
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/ajuda">
                Ver Central de Ajuda <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FaqSection;
