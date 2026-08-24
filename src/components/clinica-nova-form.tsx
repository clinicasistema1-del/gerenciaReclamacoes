import { createClinic } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClinicaLocalidadeFields } from "@/components/clinica-localidade-fields";

export function ClinicaNovaForm() {
  return (
    <form action={createClinic} className="grid gap-3 md:grid-cols-4">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required />
      </div>
      <ClinicaLocalidadeFields idPrefix="nova-" />
      <div className="md:col-span-4">
        <Button type="submit">Cadastrar</Button>
      </div>
    </form>
  );
}
