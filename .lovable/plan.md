
O usuário está no `ContinueBar` durante o `handleContinue` (renderização final + upload + criação do pending checkout) e o botão mostra "Gerando preview...". O texto correto deveria ser "Processando compra..." pois nessa etapa não há geração de preview IA — é renderização do mockup + upload para checkout.

Vou localizar onde esse texto aparece.
