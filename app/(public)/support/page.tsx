import type { Metadata } from 'next';
import { getSupportCampaigns } from '@/lib/data/content';
import { PageHeader } from '@/components/layout/page-header';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Support Mesca CL',
  description:
    'Support the work behind Mesca CL. Contribute to ongoing projects, writing, and open-source builds.',
};

export default async function SupportPage() {
  const campaigns = await getSupportCampaigns(true);

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Support Mesca CL"
        description="If my work has been useful to you, consider supporting the build. Contributions help fund hardware, hosting, and time spent writing and sharing openly."
      />

      <section className="container pb-20 md:pb-28">
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
            <h2 className="mt-4 font-display text-xl font-semibold">No active campaigns</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              There are no active support campaigns at the moment. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="group flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {campaign.currency?.toUpperCase() ?? 'NGN'}
                  </span>
                  {campaign.target_amount && (
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground/70">
                      Target: {campaign.target_amount}
                    </span>
                  )}
                </div>

                <h2 className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight">
                  {campaign.title}
                </h2>

                {campaign.purpose && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{campaign.purpose}</p>
                )}

                {campaign.description && (
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {campaign.description}
                  </p>
                )}

                {campaign.suggested_amounts && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {campaign.suggested_amounts
                      .split(',')
                      .map((a) => a.trim())
                      .filter(Boolean)
                      .map((amount) => (
                        <span
                          key={amount}
                          className="rounded-md border border-border/80 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {amount}
                        </span>
                      ))}
                  </div>
                )}

                {campaign.bank_account_holder || campaign.bank_name || campaign.account_number || campaign.payment_instructions && (
                  <div className="mt-4 rounded-lg border border-border/80 bg-muted/20 p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Bank details</p>
                    {campaign.bank_account_holder && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Account holder:</span> {campaign.bank_account_holder}
                      </p>
                    )}
                    {campaign.bank_name && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Bank:</span> {campaign.bank_name}
                      </p>
                    )}
                    {campaign.account_number && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Account number:</span> {campaign.account_number}
                      </p>
                    )}
                    {campaign.payment_instructions && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Instructions:</span> {campaign.payment_instructions}
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
