import styles from './Input.module.css'

export default function Input({
                                  placeholder,
                                  variant = 'default', // "default" for welcome page, "serach", "chat"
                                  id,
                                  type = 'text',
                                  name,
                                  ariaLabel,
                                  autoComplete,
                                  required = false,
                                  className = '',
                                  ...props
                              }) {

    const textInputClasses = `${styles.input} ${styles[variant]}`.trim()


    return (
        <input id={id} type={type} name={name} autoComplete={autoComplete} className={textInputClasses} aria-label={ariaLabel}
               placeholder={placeholder} required={required}/>
    )
}