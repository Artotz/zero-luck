import { motion } from 'framer-motion'
import { Hand as HandIcon, ScrollText, Swords } from 'lucide-react'
import { CARD_TYPES, type CardType, type Hand } from '../game/types'

interface PlayerHandProps {
  hand: Hand
  disabled: boolean
  onPlayCard: (card: CardType) => void
}

const iconMap = {
  Rock: HandIcon,
  Paper: ScrollText,
  Scissors: Swords,
}

const descriptionMap: Record<CardType, string> = {
  Rock: 'Controle bruto contra tesouras.',
  Paper: 'Resposta de cobertura contra pedra.',
  Scissors: 'Ataque rapido contra papel.',
}

export function PlayerHand({ hand, disabled, onPlayCard }: PlayerHandProps) {
  return (
    <section className="player-hand">
      <p className="panel-kicker">Player Hand</p>
      <h2>Escolha sua carta</h2>
      <div className="player-hand-grid">
        {CARD_TYPES.map((card, index) => {
          const Icon = iconMap[card]
          const quantity = hand[card]

          return (
            <motion.button
              key={card}
              type="button"
              className="card-button"
              disabled={disabled || quantity === 0}
              onClick={() => onPlayCard(card)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={disabled || quantity === 0 ? undefined : { y: -6 }}
              whileTap={disabled || quantity === 0 ? undefined : { scale: 0.98 }}
            >
              <div className="card-headline">
                <div>
                  <div className="card-name">{card}</div>
                  <div className="card-meta">{descriptionMap[card]}</div>
                </div>
                <span className="card-quantity">x{quantity}</span>
              </div>
              <Icon size={34} className="card-icon" />
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
