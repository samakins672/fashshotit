import Reveal from "./Reveal";

export default function SectionHeading({ title }: { title: string }) {
  return (
    <div className="section-heading">
      <h2 className="heading-h2">
        <Reveal as="span" variant="wipe">
          {title}
        </Reveal>
      </h2>
      <Reveal as="span">
        <img src="/images/divider.png" alt="" width={76} height={9} />
      </Reveal>
    </div>
  );
}
