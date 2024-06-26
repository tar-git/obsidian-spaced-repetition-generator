import { AbstractTransformer } from "./abstract_transformer"

enum CurrentState {
    None,
    InsideProps,
    InsideTags,
    Heading,
    Empty,
}

export class FlashcardTransformer extends AbstractTransformer {
   
    protected processHeadingLine(): string | null {
        this.current = super.processHeadingLine()
        if (this.next != this.flashCardSeparator) {
            this.current = this.current + '\n' + this.flashCardSeparator
        }
        return this.current
    }
    
    protected processRegular() : string | null {
        // if (this.isEmpty(this.next)) {
        //     this.current = this.current + '<br>'
        // }
        return this.current
    }
    
    protected processEmptyLine(): string | null {
        if (this.next == null || this.isHeading(this.next) || this.isSeparator(this.next)) {
            if (this.outputContent.slice(-5, -1) == '<br>') {
                let lastChar = this.next == null ? '' : '\n'
                this.outputContent = this.outputContent.slice(0, -5) + lastChar
            }
            return ''
        }
        if (this.isFlashCardSeparator(this.outputContent.slice(-2, -1))) {
            return null
        }
        return '<br>'
    }
    
    protected processTagLine(): string | null {
        if (this.current == '---') {
            this.prevState = CurrentState.InsideProps
            this.state = CurrentState.None
            if (!this.alreadyHasFlashTag) {
                return '  - ' + this.flashCardSymbol + '\n---'
            }
            return this.current
        }
        if (this.isTag(this.current)) {
            this.alreadyHasFlashTag = this.alreadyHasFlashTag || this.hasFlashTag(this.current)
            return this.current
        } else {
            this.state = CurrentState.InsideProps
            if (!this.alreadyHasFlashTag) {
                return '  - ' + this.flashCardSymbol + '\n' + this.current
            }
            return this.current
        }
    }
}
